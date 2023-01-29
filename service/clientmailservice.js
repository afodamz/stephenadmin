import { v4 as uuidv4 } from 'uuid';
import path from 'path';


const __dirname = path.resolve();

export default class ClientMailService {

    constructor(DB) {
        this.DB = DB;
    }

    deleteMail = (req, res) => {
        var id = req.params.id

        const Query = "UPDATE clients SET is_deleted = ? WHERE id = ?";
        const Options = [true, id];
        this.DB.query(Query, Options, (err, result) => {
            if (err) throw err;
            if (result) {
                req.flash(
                    "success_msg",
                    "Category Successfully added."
                );
                res.redirect("/admin/categories");
            }
        });
    }

    createClientService = (req, res) => {
        var { email } = req.body;
        
        let errors = [];

        if (!email) {
            errors.push({ msg: "Please enter required fields" })
        }
        
        const Query = `SELECT * FROM clients WHERE is_deleted=? and email=?`;
        this.DB.query(Query, [false, email], (err, clients) => {
            if (err) throw err;
            // if exists reurn json resoponse
            res.json({
                success: true,
                message: "You already subscribed for mail notifications"
            })
        });
        if (errors.length > 0) {
            res.json({
                success: false,
                errors,
                email
            })
        } else {
            const Query = "INSERT INTO clients SET ?";
            const Options = {
                id: uuidv4(),
                email,
                dateCreated: new Date()
                // dateCreated: moment().format("MM ddd, YYYY HH:mm:ss a")
            };
            this.DB.query(Query, Options, (err, result) => {
                if (err) throw err;
                if (result) {
                    res.json({
                        success: true,
                        message: "notification createx successfully"
                    })
                }
            });
        }
    }

    getClientService = (req, res, DB) => {
        const { name } = req.query;
        const Query = `SELECT * FROM clients WHERE is_deleted is false`;
        // const categoriesQuery = `SELECT * FROM category WHERE name = ${name} and is_deleted is false`;
        this.DB.query(Query, (err, clients) => {
            if (err) throw err;
            res.render("clients/get", {
                clients,
                moment
            });
        });
    } 
}