var express = require("express");
var bodyParser = require("body-parser");

var hostname= 'localhost';
var port = 3000;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var myRouter = express.Router();

myRouter.route('/piscines')
// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
    .get(function(req,res){
        console.log("GET - Piscine");
        res.json({message : "Liste toutes les piscines de Lille Métropole", methode : req.method});
    })
    //POST
    .post(function(req,res){
        res.json({message : "Ajoute une nouvelle piscine à la liste",
            nom : req.body.nom,
            ville : req.body.ville,
            taille : req.body.taille,
            methode : req.method});
    })
    //PUT
    .put(function(req,res){
        res.json({message : "Mise à jour des informations d'une piscine dans la liste", methode : req.method});
    })
    //DELETE
    .delete(function(req,res){
        res.json({message : "Suppression d'une piscine dans la liste", methode : req.method});
    });

myRouter.route('/piscines/:piscine_id')
    .get(function(req,res){
        res.json({message : "Vous souhaitez accéder aux informations de la piscine n°" + req.params.piscine_id});
    })
    .put(function(req,res){
        res.json({message : "Vous souhaitez modifier les informations de la piscine n°" + req.params.piscine_id});
    })
    .delete(function(req,res){
        res.json({message : "Vous souhaitez supprimer la piscine n°" + req.params.piscine_id});
    });

myRouter.route('/piscines')
// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
    .get(function(req,res){
        res.json({
            message : "Liste les piscines de Lille Métropole avec paramètres :",
            ville : req.query.ville,
            nbResultat : req.query.maxresultat,
            methode : req.method });

    })

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

app.listen(port, hostname, function () {
    console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port+"\n");
});

