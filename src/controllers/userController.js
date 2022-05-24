const mongoose = require("mongoose");
const aws = require("aws-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/userModel");
const validator = require('../Validator/validation');
const userModel = require("../Models/userModel")



// ********************************************** AWS-S3 ********************************************** //
aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",  // id
    secretAccessKey: "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",  // secret password
    region: "ap-south-1"
});
// this function uploads file to AWS and gives back the url for the file
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", // HERE
            Key: "group37/profileImages/" + file.originalname, // HERE    
            Body: file.buffer,
        };

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err });
            }
            console.log(data)
            console.log("File uploaded successfully.");
            return resolve(data.Location); //HERE 
        });
    });
};


// ************************************************************* POST /register ************************************************************ //

const createUser = async function (req, res) {
    try {
        // let data = req.body
        let body = JSON.parse(JSON.stringify(req.body))
        // body.address = JSON.parse(body.address)


        //Validate body 

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "User body should not be empty" });
        }

        let { fname, lname, email, password, phone, address } = body

        // Validate fname
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname must be present" })
        }

        // Validation of fname
        if (!validator.isValidName(fname)) {
            return res.status(400).send({ status: false, msg: "Invalid fname" })
        }

        // Validate lname
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname must be present" })
        }

        // Validation of lname
        if (!validator.isValidName(lname)) {
            return res.status(400).send({ status: false, msg: "Invalid lname" })
        }

        // Validate email
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email must be present" })
        }

        // Validation of email id
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email id" })
        }

        // Validate password
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password must be present" })
        }

        // Validation of password
        if (!validator.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Invalid password" })
        }

        // Validate phone
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone must be present" })
        }

        // Validation of phone number
        if (!validator.isValidNumber(phone)) {
            return res.status(400).send({ status: false, msg: "Invalid phone number" })
        }

        // Validate address
        if (!address) {
            return res.status(400).send({ status: false, message: "Address is required" })
        }
        address = JSON.parse(address)
        // Validate shipping address
        if (!address.shipping) {
            return res.status(400).send({ status: false, message: "Shipping address is required" })
        }

        // Validate street, city, pincode of shipping
        if (!validator.isValid(address.shipping.street && address.shipping.city && address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Shipping address details is/are missing" })
        }

        // Validate shipping pincode
        if (!validator.isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
        }

        // Validate billing address
        if (!validator.isValid(address.billing)) {
            return res.status(400).send({ status: false, message: "Billing address is required" })
        }

        // Validate street, city, pincode of billing
        if (!validator.isValid(address.billing.street && address.billing.city && address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing address details is/are missing" })
        }

        // Validate billing pincode
        if (!validator.isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
        }


        // Duplicate entries
        email = email.toLowerCase().trim()
        let isAlredyUsed = await UserModel.findOne({ email });
        if (isAlredyUsed) {
            return res.status(400).send({ status: false, message: ` ${email} mail is already registered` })
        }

        let duplicatePhone = await UserModel.findOne({ phone });
        if (duplicatePhone) {
            return res.status(400).send({ status: false, message: `${phone} phone is already used` })
        }


        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);


            // encrypted password
            let encryptPassword = await bcrypt.hash(password, 12)

            profileImage = uploadedFileURL
            body.address = JSON.parse(body.address)
            let userData = { fname, lname, email, profileImage, phone, password: encryptPassword, address }

            let savedData = await UserModel.create(userData)
            return res.status(201).send({ status: true, message: "User created successfully", data: savedData })
        }
        else {
            return res.status(400).send({ status: false, msg: "No file found" });
        }

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
};


<<<<<<< HEAD


const grtUser = async (req,res)=>{
    try{
        let userId = req.params.userId
        let tokenId = req.userId

        if(!(validator.isValid(userId))){
            return res.status(400).send({status:false , message:"Please Provide User Id"})
        }

        if(!(validator.isValidObjectId(userId))){
            return res.status(400).send({status:false , message:"invalid userId"})
        }
        

        if(!(validator.isValidObjectId(userId))){
            return res.status(400).send({status:false , message:"invalid Token"})
        }

        if (!(userId==tokenId)){
            return res.status(401).send({status:false , message:"Unauthorized User"})
        }

        let checkData = await userModel.findOne({_id:userId})

        if (!checkData){
            return res.status(404).send({status:false , message:"User not Found"})
        }

        return res.status(200).send({status:true, message:"Success",data : checkData })

    }
    catch(error){
return res.status(500).send({status:false , message:error.message })
    }

}
=======
const login = async function (req, res) {
    try {
        const data = req.body;
        if (Object.keys(data).length <= 0) {
            return res.status(400).send({ status: false, message: "Plz Enter Email & Password In Body !!!" });
        }
        if (Object.keys(data).length >= 3) {
            return res.status(400).send({ status: false, message: "Only Enter Email & Password In Body !!!" });
        }


        const email = req.body.email;
        if (!email) {
            return res.status(400).send({ status: false, message: "Plz Enter Email In Body !!!" });
        }
        const findData = await UserModel.findOne({ email }).select({ email: 1, password: 1 });
        if (!findData) {
            return res.status(400).send({ status: false, message: "Plz Enter Valid Email-Id !!!" });
        }


        const password = req.body.password;
        if (!password) {
            return res.status(400).send({ status: false, message: "Plz Enter Password In Body !!!" });
        }
        const match = await bcrypt.compare(password, findData.password);
        if (match == false) {
            return res.status(400).send({ status: false, message: "Plz Enter Valid Password !!!" });
        }


        const userId = findData._id;
        const token = jwt.sign({
            userId: userId,
            expiresIn: "1000s"
        },
            "GroupNo14"
        );

        res.status(200).send({
            status: true,
            message: "User login successfull",
            data: { userId: userId, token: token }
        });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};


module.exports = { createUser, login };
>>>>>>> 9b0b90f94ea8f8259fc7b4df113b9c1bb1310ee5
