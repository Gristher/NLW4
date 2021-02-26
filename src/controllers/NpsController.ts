import { Request, Response } from "express";
import { getCustomRepository, IsNull, Not } from "typeorm";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class NpsController{
    async execute( request: Request, response: Response){
        //Recebe o ID da pesquisa
        const { survey_id } = request.params;

        //Faz a busca de todas as respostas |Não Nulas| referente a essa pesquisa
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        const surveysUsers = await surveysUsersRepository.find({
            survey_id,
            value: Not(IsNull()),
        })

        //Filtra os Detratores, promotores e passivos
        const detractor = surveysUsers.filter(
            (survey) => survey.value >= 0 && survey.value <= 6
            ).length;

        const passives = surveysUsers.filter(
            (survey) => survey.value >= 7 && survey.value <= 8
        ).length;
            
        const promoters = surveysUsers.filter(
            (survey) => survey.value >= 9 && survey.value <= 10
        ).length;

        //Calculo de total de respostas
        const totalAnswers = surveysUsers.length;
    
        //Calculo de NPS
        const calculate = Number(
            (((promoters - detractor) / totalAnswers) * 100).toFixed(2)
        );

        return response.json({
            detractor, 
            passives, 
            promoters, 
            totalAnswers, 
            nps: calculate
        })
    }
}

export { NpsController }