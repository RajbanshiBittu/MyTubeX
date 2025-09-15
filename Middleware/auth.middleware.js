import jwt from 'jsonwebtoken';

export const checkAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] //

        if(!token) {
            return res.status(401).json({erroe: "No token is provided"});
        }

        //decode
        const decodedUser = jwt.verify(token, process.env.JWT_TOKEN);

        //Attach user
        req.user = decodedUser;
        next();
    } catch (error) {
       res.status(500).json({error: "Something went wrong", message: "error.message"});
    }
}

