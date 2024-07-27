import express from 'express';
import fileUpload from 'express-fileupload';

import fs from 'fs';

import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.static("public"));
// app.use(express.urlencoded({extended:true}))
const sizeImg = 5
app.use(fileUpload({
    limits: { fileSize: sizeImg * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: `El peso de tu archivo supera los ${sizeImg}MB`,
    })
);

app.listen(3000,()=>{
    console.log("Servidor escuchando en http://localhost:3000");
})

app.get("/", (req,res)=>{
    res.sendFile(path.resolve(__dirname,"./public/formulario.html"))
});

app.get("/collage",(re,res)=>{
    res.sendFile(path.resolve(__dirname,("./public/collage.html")));
});


//endpoint

app.post("/imagen", (req,res)=>{
    let {target_file} = req.files;
    let { posicion } = req.body;

    if(!target_file || ! posicion){
        return res.status(500).json({
            msg:"Debe proporcionar una imagen y una posición"
        });
    };

    //restriccion para tipo de documento

    if(target_file.mimetype.split("/")[0] != "image"){
        return res.send("El tipo de archivo no esta permmitido para guardar")
    }
    
    // guardando imagen en directorio storage

    let nombreImagen = `imagen-${posicion}.jpg`;

    let rutaStorage = path.resolve(__dirname,"./public/imgs",nombreImagen);

    target_file.mv(rutaStorage,(error)=>{
        if(error){
            return res.status(500).json({
                msg:"Error al cargar imagen al servidor"
            });
        }
    });

    res.redirect("/collage")
});

app.get("/deleteImg/:image", (req,res)=>{
    try {
        let {image }= req.params;

        let imagenes = fs.readdirSync(path.join(__dirname,("./public/imgs")));

        if(imagenes.includes(image)){
            fs.unlinkSync(path.join(__dirname, "./public/imgs/", image));

            res.redirect("/collage");
        }else{
            res.send("<h1>esta intentando eliminar una imagen que no existe</h1>")
        }

       
    } catch (error) {
        console.log(error);
        res.send("<h1>Error al procesar eliminación de imágen</h1>")
    }
})