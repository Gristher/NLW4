import { Request, Response } from "express";
import { resolve } from "path";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";


class SendMailController{

    async execute( request: Request, response: Response){
        const {email, survey_id} = request.body;

        const userRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await userRepository.findOne({ email});

        if(!user){
            throw new AppError("User does not exists!");
        }

        const survey = await surveysRepository.findOne({ id: survey_id})

        if(!survey){       
            throw new AppError("Survey does not exists!");
        }


        //Verifica se já existe a pesquisa
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: {user_id: user.id, value: null},
            relations: ["user", "survey"],
        });

        //Declarando variaveis e path 
        const npsPath = resolve(__dirname, "..", "views", "email", "npsMail.hbs");
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
            };
        
        //Reenvia a pesquisa já existente, evitando duplicidade
        if(surveyUserAlreadyExists){
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists)
        }

        //Salvar as informações na tabela surveyUser
        const surveyUser = surveysUsersRepository.create({ 
            user_id: user.id,
            survey_id
        });

        await surveysUsersRepository.save(surveyUser);
        variables.id = surveyUser.id

        // Enviar e-mail para o usuário      
        await SendMailService.execute(email, survey.title ,variables, npsPath);

        return response.json(surveyUser);
    }
}


export { SendMailController }