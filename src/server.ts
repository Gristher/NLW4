import express from 'express';

const app = express();

// http://localhost:3333/
app.get("/", (req, res) => {

    return res.json({message: 'Hello World - NLW04'})
});

// 1º param: ROTA (RECURSO API)
// 2º param: request,response
app.post("/", (req, res) =>{
    //Recebeu os dados para salvar

return res.json({message: "Os dados foram salvos com sucesso!"});
});



app.listen(3333, () => console.log("Server is running"));