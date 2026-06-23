import User from "../model/user.model.js";
import Verify from "../model/verify.model.js";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import { validatePassword } from "../utils/passwordValidation.js";

const createTransporter = () =>
    nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        requireTLS: true,
        auth: {
            user: "kuntalanuj6@gmail.com",
            pass: "cbfdjltkplkxbpnm", // app password
        },
    });

const sendOtpMail = async (fullname, email, otp, purpose = "signup", retries = 5) => {
    const subject =
        purpose === "reset_password"
            ? "TRiP: OTP for Password Reset"
            : "TRiP: OTP for Verification";

    const text =
        purpose === "reset_password"
            ? `Hello ${fullname},
Use this OTP to reset your password: ${otp}`
            : `Hello ${fullname},
Your OTP: ${otp}`;

    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: "kuntalanuj6@gmail.com",
            to: email,
            subject,
            text,
        };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully on attempt ${attempt}`);
                return;
            } catch (error) {
                console.error(`Error sending email on attempt ${attempt}: ${error.message}`);
                if (attempt === retries) {
                    throw new Error("Failed to send email after multiple attempts");
                }
            }
        }
    } catch (error) {
        console.log("Error: " + error.message);
        throw new Error("Technical error in sending OTP");
    }
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const signup = async(req, res) => {
    try {
        const { fullname, email, password, username } = req.body;
        console.log(fullname);
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already used" });
        }
        const usern = await User.findOne({ username });
        if (usern) {
            return res.status(400).json({ message: "This Username is not available" });
        }

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            return res.status(400).json({ message: passwordCheck.message });
        }

        const hashPassword = await bcryptjs.hash(password, 10);
        const createdUser = new User({
            fullname: fullname,
            email: email,
            username: username,
            password: hashPassword,
        });
        const userdata=await createdUser.save();
        console.log("data aa gya");
        const otp = generateOtp();
if(userdata){
    await sendOtpMail(fullname, email, otp, "signup");
    //generate a otp and save a document in verify model 
    const createdOtp = new Verify({
        otp: otp,
        user_id: createdUser._id,
        purpose: "signup",
    });
    await createdOtp.save();
    console.log("verify wala model create ho gya")

    res.status(201).json({
            message: "User created successfully",
            user: {
                _id: createdUser._id,
                fullname: createdUser.fullname,
                username: createdUser.username,
                email: createdUser.email,
            },
        });
    }

    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const profile = async(req, res) => {
    try {
        const { username } = req.query;
        const user = await User.findOne({ username });
        console.log(user);
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        } else {
            res.status(200).json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    username: user.username,
                },
            });
        }
    } catch (error) {
        console.log("Error: " + error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const verifymail=async(req,res)=>{
    const {user_id,otp}=req.body;
    const Userr=await User.findOne({_id:user_id});
    const userr=await Verify.findOne({
        user_id: user_id,
        $or: [{ purpose: "signup" }, { purpose: { $exists: false } }],
    });
    if(!userr){
        return res.status(400).json({message:"OTP expired or invalid"});
    }

    if(String(userr.otp)===String(otp)){
        await User.updateOne({_id:user_id},{$set:{isverified:true}});
        await Verify.deleteOne({
            user_id: user_id,
            $or: [{ purpose: "signup" }, { purpose: { $exists: false } }],
        });
        res.status(201).json({message:"Email Verified successfully",
        user: {
            _id: Userr._id,
            fullname: Userr.fullname,
            username: Userr.username,
            email: Userr.email,
        },
        });
    }
    else{
        res.status(400).json({message:"Invalid OTP"});
    }

}

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const otp = generateOtp();
        await sendOtpMail(user.fullname, user.email, otp, "reset_password");

        await Verify.findOneAndUpdate(
            { user_id: user._id, purpose: "reset_password" },
            { otp, timestamp: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({ message: "Password reset OTP sent successfully" });
    } catch (error) {
        console.log("Error: " + error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required" });
        }

        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.valid) {
            return res.status(400).json({ message: passwordCheck.message });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const otpRecord = await Verify.findOne({
            user_id: user._id,
            purpose: "reset_password",
        });

        if (!otpRecord || String(otpRecord.otp) !== String(otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashPassword = await bcryptjs.hash(newPassword, 10);
        await User.updateOne({ _id: user._id }, { $set: { password: hashPassword } });
        await Verify.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.log("Error: " + error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
