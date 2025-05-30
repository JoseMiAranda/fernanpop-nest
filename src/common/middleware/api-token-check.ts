import firebase from '../../firebase/firebase';
import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common'
import { HttpException } from '@nestjs/common/exceptions/http.exception'
import { Request, Response } from 'express'

@Injectable()
export class ApiTokenCheck implements NestMiddleware {
    async use(req: Request, _: Response, next: Function) {
        const { authorization } = req.headers;

        console.log('authorization', authorization)

        if(!authorization) {
            throw new HttpException({ message: 'Authorization api key required' }, HttpStatus.UNAUTHORIZED)
        }

        // Barear ezawagawg.....
        const token = authorization.slice(7)

        const user = await firebase
          .auth()
          .verifyIdToken(token)
          .catch(err => {
            throw new HttpException({ message: 'Authorization invalid', err }, HttpStatus.FORBIDDEN)
          })
    
        // Agregamos a nuestra serverva nuestro usuario
        req.firebaseUser = user
        next();
      }
}
