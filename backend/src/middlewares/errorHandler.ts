import { Request, Response, NextFunction } from "express"

export default (err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
}