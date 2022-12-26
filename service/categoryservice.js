import passport from 'passport';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'

export default class CategoryServices {

    constructor(DB) {
        this.DB = DB;
    }

    createCategoryService = (req, res) => {
        console.log("body", req.body)
        var { name, description } = req.body;
        let errors = [];

        if (!name) {
            errors.push({ msg: "Please enter required fields" })
        }

        if (errors.length > 0) {
            res.render("categories/get", {
                errors,
                name
            });
        } else {
            const Query = "INSERT INTO category SET ?";
            const Options = {
                id: uuidv4(),
                name,
                description,
                dateCreated: new Date()
                // dateCreated: moment().format("MM ddd, YYYY HH:mm:ss a")
            };
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
    }

    updateCategoryService = (req, res) => {
        var { name, description, categoryId } = req.body;
        var id = req.params.id
        let errors = [];

        if (!name) {
            errors.push({ msg: "Please enter required fields" })
        }

        if (errors.length > 0) {
            res.render("categories/get", {
                errors,
                name
            });
        } else {
            // const Query = "INSERT INTO category SET ?";
            const Query = "UPDATE category SET name = ?, description = ? WHERE id = ?";
            const Options = [name, description, id];
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
    }

    deleteCategoryService = (req, res) => {
        var id = req.params.id

        const Query = "UPDATE category SET is_deleted = ? WHERE id = ?";
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

}