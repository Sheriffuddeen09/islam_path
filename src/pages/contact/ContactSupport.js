import {
    Mail,
    MessageCircle,
    Phone,
    HelpCircle,
     ShieldCheck, BadgeAlert, Scale, HeartHandshake,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../Api/axios";
import Accordion from "./Accordion";



export default function ContactSupport() {
    
const [loading, setLoading] = useState(false);

const [showSupportModal,setShowSupportModal]=useState(false);

const [formData,setFormData]=useState({
    fullName:"",
    email:"",
    issue:"",
    message:"",
});


const openSupportModal=(issue="")=>{

    setFormData((prev)=>({
        ...prev,
        issue
    }));

    setShowSupportModal(true);

};


const closeSupportModal=()=>{

    setShowSupportModal(false);

};


const handleChange = (e) => {
    setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
    }));
};


const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {

        const response = await api.post(
            "/api/support/contact",
            formData
        );

        toast.success(response.data.message);

        setFormData({
            fullName: "",
            email: "",
            issue: "",
            message: "",
        });

        // Close modal
        closeSupportModal();
    } catch (error) {

        if (error.response?.data?.errors) {

            Object.values(
                error.response.data.errors
            ).forEach((err) => {

                toast.error(err[0]);

            });

        } else {

            toast.error(
                error.response?.data?.message ||
                "Unable to submit your request."
            );

        }

    } finally {

        setLoading(false);

    }
};


    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Heading */}
                

<div className="mb-10 mt-14 rounded-3xl overflow-hidden border border-emerald-200 
bg-[var(--bg-color)] text-[var(--text-color)]">


    <div className="p-8 border-b border-emerald-200">

        <div className="flex items-center gap-4 mb-4">

            <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg">
                <ShieldCheck size={35} />
            </div>

            <div>
                <h1 className="sm:text-3xl text-xl font-bold text-emerald-700">
                    Our Commitment
                </h1>

                <p className="text-sm">
                    Promoting Halal values, beneficial knowledge,
                    ethical businesses, and the positive development
                    of Islam and humanity.
                </p>
            </div>

        </div>

        <p className="leading-6 text-sm ">
            Our platform is committed to providing a safe,
            trustworthy, and family-friendly environment for
            students, teachers, businesses, communities, and
            organizations. We encourage lawful (Halal),
            beneficial, and ethical activities that contribute
            positively to society and support the growth and
            development of Islam through education, employment,
            technology, and community engagement.
        </p>

    </div>


    <div className="grid lg:grid-cols-2 gap-3 sm:p-4 p-2">

        <div className="bg-white rounded-2xl shadow-md sm:p-4 p-2">

            <div className="flex gap-3 items-center mb-4">

                <HeartHandshake
                    className="text-emerald-600"
                    size={28}
                />

                <h2 className="font-bold text-xl">
                    What We Support
                </h2>

            </div>

            <ul className="space-y-3 text-sm list-disc ml-5">

                <li>
                    Halal products, businesses, and services.
                </li>

                <li>
                    Educational and beneficial content.
                </li>

                <li>
                    Ethical employment opportunities.
                </li>

                <li>
                    Sponsored advertisements that comply with
                    our policies.
                </li>

                <li>
                    Family-friendly communities and channels.
                </li>

                <li>
                    Technology, innovation, and professional
                    development.
                </li>

                <li>
                    Charitable and community initiatives.
                </li>

                <li>
                    Positive contributions towards the
                    development of Islam and humanity.
                </li>

            </ul>

        </div>


        <div className="bg-white rounded-2xl shadow-md sm:p-4 p-2">

            <div className="flex gap-3 items-center mb-4">

                <BadgeAlert
                    className="text-red-600"
                    size={28}
                />

                <h2 className="font-bold text-xl">
                    Prohibited Activities
                </h2>

            </div>

            <ul className="space-y-3 text-sm list-disc ml-5">

                <li>
                    Gambling, betting, and unlawful financial
                    schemes.
                </li>

                <li>
                    Adult or inappropriate materials.
                </li>

                <li>
                    Fraudulent activities and fake identities.
                </li>

                <li>
                    Fake employment opportunities and scams.
                </li>

                <li>
                    Illegal products or prohibited services.
                </li>

                <li>
                    Harassment, bullying, and abusive conduct.
                </li>

                <li>
                    Misleading advertisements or sponsored
                    content.
                </li>

                <li>
                    Content promoting Haram or prohibited
                    activities.
                </li>

            </ul>

        </div>

    </div>

    <div className="px-8 pb-2">

        <div className="rounded-2xl sm:p-6 p-2 ">

            <div className="flex items-center gap-3 mb-4">

                <Scale
                    className="text-red-600"
                    size={30}
                />

                <h2 className="font-bold sm:text-2xl text-xl text-red-600">
                    Platform Policy & User Ban Notice
                </h2>

            </div>

            <p className="text-sm leading-6">
                Every advertisement, product, channel,
                community, post, video, reel, sponsored
                content, job profile, and user account may be
                reviewed by our moderation team. Users found
                violating our Community Guidelines or Platform
                Policies may be subject to disciplinary actions.
            </p>

            <ul className="mt-2 space-y-3 list-disc ml-5 text-sm">

                <li>
                    Removal of prohibited content.
                </li>

                <li>
                    Advertisement or product rejection.
                </li>

                <li>
                    Suspension of account privileges.
                </li>

                <li>
                    Temporary account restrictions.
                </li>

                <li>
                    Permanent account termination (ban).
                </li>

                <li>
                    Reporting unlawful activities to the
                    appropriate authorities where required by
                    law.
                </li>

            </ul>

            <div className="mt-3 rounded-2xl bg-white border border-red-200 p-5">

                <p className="font-semibold text-red-600 leading-8">
                    IMPORTANT NOTICE:
                </p>

                <p className="mt-2 text-sm leading-6">
                    Any user found promoting fraud, fake
                    identities, prohibited (Haram) activities,
                    illegal services, misleading advertisements,
                    or attempting to harm other members of our
                    community may be permanently banned from the
                    platform without prior notice.
                </p>

            </div>

        </div>

    </div>

</div>

                <div className="mt-2 rounded-2xl shadow-xl  p-4 text-center shadow-lg mb-10">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Contact & Support Center
                    </h1>

                    <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                        Need help? We're here to assist you. Please
                        select your issue category and provide a detailed
                        description so we can resolve it quickly.
                    </p>
                </div>

                <Accordion />

                {/* Contact Cards */}

                <div className="grid lg:grid-cols-3 gap-6 mt-10">
                    <div
                      onClick={()=>openSupportModal("Email Support")}
                      className="bg-white shadow-lg rounded-2xl p-6 border cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >

                          <Mail
                          className="text-blue-600 mb-4"
                          size={40}
                          />

                          <h2 className="text-xl font-bold mb-2">
                              Email Support
                          </h2>

                          <p className="text-gray-600 text-sm">
                              Email us for more Information
                          </p>

                          <p className="text-sm text-gray-500 mt-2">
                              Available 24/7 for all support requests.
                          </p>

                      </div>

                    <a
                    href="https://wa.link/cjgjw0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white shadow-lg rounded-2xl p-6 border cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                    <MessageCircle
                        className="text-green-600 mb-4"
                        size={40}
                    />

                    <h2 className="text-xl font-bold mb-2">
                        WhatsApp Support
                    </h2>

                    <p className="text-gray-600 text-sm">
                        Click to Start Chatting
                    </p>

                    <p className="text-sm text-gray-500 mt-2 ">
                        Chat with our support team directly.
                    </p>
                </a>

                    <div  className="bg-white shadow-lg rounded-2xl p-6 border cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <Phone
                            className="text-purple-600 mb-4"
                            size={40}
                        />

                        <h2 className="text-xl font-bold mb-2">
                            Support Hours
                        </h2>

                        <p className="text-gray-600 text-sm">
                            +23409150965341
                        </p>

                        <p className="text-sm text-gray-500 mt-2 text-sm">
                           Monday - Saturday, 8:00 AM - 6:00 PM
                        </p>
                    </div>
                </div>

                {/* Contact Form */}


                {/* Footer */}

                <div className="mt-6 rounded-2xl shadow-xl  p-4 text-center shadow-lg">
                    <HelpCircle
                        size={50}
                        className="mx-auto mb-4"
                    />

                    <h2 className="text-xl sm:text-2xl font-bold">
                        We're Here To Help
                    </h2>

                    <p className="mt-3 max-w-3xl mx-auto text-sm">
                        Kindly provide accurate information and
                        screenshots whenever possible. This helps our
                        support team resolve your issue faster and keeps
                        our platform safe for everyone.
                    </p>
                </div>
            </div>

            {
showSupportModal && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

<div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh]
scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin overflow-y-auto p-8 relative">


<button
onClick={closeSupportModal}
className="absolute right-5 top-5 text-gray-500 hover:text-red-600 text-2xl"
>
×

</button>


<h2 className="sm:text-3xl text-xl font-bold mb-6">
Submit a Support Request
</h2>



<form
onSubmit={handleSubmit}
className="space-y-5"
>

<div>

<label className="font-semibold">
Full Name
</label>

<input
type="text"
name="fullName"
required
value={formData.fullName}
onChange={handleChange}
placeholder="Enter your name"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="font-semibold">
Email Address
</label>

<input
type="email"
name="email"
required
value={formData.email}
onChange={handleChange}
placeholder="Enter your email"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="font-semibold">
Select Issue
</label>

<select
name="issue"
required
value={formData.issue}
onChange={handleChange}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">
Select an Issue
</option>


<option>
Login - Internal Server Error
</option>

<option>
Login - Network Error
</option>

<option>
Login - Incorrect Email or Password
</option>

<option>
Registration - Email Already Exists
</option>

<option>
Registration - Phone Number Already Exists
</option>

<option>
Forgot Password Issues
</option>

<option>
Reset Password Issues
</option>

<option>
Advertisement Approval Issues
</option>

<option>
Job Creator Profile Approval
</option>

<option>
Job Finder Profile Approval
</option>

<option>
Report a Bug
</option>

<option>
Other Support Issues
</option>

</select>

</div>



<div>

<label className="font-semibold">
Describe Your Issue
</label>

<textarea
rows={6}
required
name="message"
value={formData.message}
onChange={handleChange}
placeholder="Please describe your issue."
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<button
type="submit"
disabled={loading}
className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50"
>

{
loading ?

<>
<Loader2
className="animate-spin"
size={20}
/>

Submitting

</>

:

"Submit Request"

}


</button>


</form>

</div>

</div>

)}
        </div>
    );
}