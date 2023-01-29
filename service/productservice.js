import { v4 as uuidv4 } from 'uuid';
import path from 'path';


const __dirname = path.resolve();

export default class ProductServices {

    constructor(DB) {
        this.DB = DB;
    }

    deleteGrillsService = (req, res) => {
        var id = req.params.id

        const Query = "UPDATE products SET is_deleted = ? WHERE id = ?";
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

    createGrillsSubmitService = (req, res) => {
        var { name, price, old_price, tags, description, status,
            categories } = req.body;
        const images = req.files;
        let errors = [];

        if (errors.length > 0) {
            res.render("grills/create", {
                errors,
                name, price, old_price, tags, description, status,
                images, categories
            });
        } else {
            var savedfilePaths = [];
            const keys = Object.keys(images)
            for (let i = 0; i < keys.length; i++) {
                var key = keys[i]
                const image = images[key]
                const fileName = new Date().getTime() + '.' + image.name.split('.').pop();
                const filePath = path.join(__dirname, 'public', '/grillsupload/')
                image.mv(filePath + fileName, function (err) {
                    if (err) {
                        res.send(err);
                    }
                });
                savedfilePaths.push(fileName);
            }
            const filePaths = JSON.stringify(savedfilePaths);

            const Query = "INSERT INTO products SET ?";
            const id = uuidv4();
            const Options = {
                id,
                name,
                price,
                old_price,
                tags,
                description,
                status,
                images: filePaths,
                dateCreated: new Date()
            };
            this.DB.query(Query, Options, (err, result) => {
                if (err) throw err;
                if (result[0]) {
                    return;
                } else {
                    // save in many to mant table
                    const ProductCategoryQuery = "INSERT INTO product_categories SET ?";
                    let ProductCategoryOptions;
                    if (categories.length > 0) {
                        ProductCategoryOptions = []
                        for (let i = 0; i < categories.length; i++) {
                            const createObject = {
                                productId: id,
                                categoriesId: categories[i],
                            }
                            ProductCategoryOptions.push(createObject)
                        }
                    } else {
                        ProductCategoryOptions = {
                            productId: Options['id'],
                            categoriesId: category,
                        }
                    }
                    this.DB.query(ProductCategoryQuery, ProductCategoryOptions, (err, result) => {
                        if (err) throw err;
                        if (result) {
                            // req.flash(
                            //     "success_msg",
                            //     "You are now registered. Please log in to continue."
                            // );
                            res.redirect("/admin/create-grills");
                        }
                    });
                }
            });
        }
    }

    updateGrillsSubmitService = (req, res) => {
        var { name, price, old_price, tags, description, status,
            categories } = req.body;
        const { images } = req.files;
        let errors = [];

        if (!name || !price || old_price || tags
            || !description || !images || !categories || !status ) {
            errors.push({ msg: "Please enter required fields" })
        }

        if (errors.length > 0) {
            res.render("grills/create", {
                errors,
                name, price, old_price, tags, description, status,
                images, categories
            });
        } else {
            var savedfilePaths = [];
            for (const image in images) {
                const filePath = path.join(__dirname, 'public', '/grillsupload/')
                image.mv(filePath + image.name, function (err) {
                    if (err) {
                        res.send(err);
                    }
                });
                savedfilePaths.push(filePath);
            }
            const filePaths = JSON.stringify(savedfilePaths);

            const Query = "INSERT INTO products SET ? where id = ? ";
            const Options = {
                id: uuidv4(),
                name,
                price,
                old_price,
                tags,
                description,
                status,
                images: filePaths,
                dateCreated: new Date()
            };
            this.DB.query(Query, Options, (err, result) => {
                if (err) throw err;
                if (result) {
                    // save in many to mant table
                    const ProductCategoryQuery = "INSERT INTO productcategories SET ?";
                    var ProductCategoryOptions = []
                    for (const productCategory in categories) {
                        ProductCategoryOptions.push({
                            productId,
                            categoryId: productCategory,
                        })
                    }
                    this.DB.query(ProductCategoryQuery, ProductCategoryOptions, (err, result) => {
                        if (err) throw err;
                        if (result) {
                            req.flash(
                                "success_msg",
                                "You are now registered. Please log in to continue."
                            );
                            res.redirect("/admin/login");
                        }
                    });
                }
            });
        }
    }

}