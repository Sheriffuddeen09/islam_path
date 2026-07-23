import {
    Lock,
    UserPlus,
    RefreshCcw,
    Shield,
    UserCheck,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Flag,
    ShieldAlert,
    PackageCheck,
    Award,
    CreditCard,
    MessagesSquare,
    BadgeDollarSign,
} from "lucide-react";


import { useState } from "react";

export default function Accordion(){

    
    const [activeAccordion, setActiveAccordion] =
    useState(null);

const [activeIssue, setActiveIssue] =
    useState({});

const toggleAccordion = (index) => {
    setActiveAccordion(
        activeAccordion === index ? null : index
    );
};

const toggleIssue = (parentIndex, issueIndex) => {
    const key = `${parentIndex}-${issueIndex}`;

    setActiveIssue((prev) => ({
        ...prev,
        [key]: !prev[key],
    }));
};


const accordions = [
    {
    title: "Login Issues",
    icon: <Lock className="text-red-500" />,
    issues: [
        {
            title: "Internal Server Error",
            reason:
                "This usually occurs when our servers are temporarily unavailable or undergoing maintenance.",
            solutions: [
                "Refresh the page and try again.",
                "Wait a few minutes before attempting to login.",
                "Check our announcements for maintenance updates.",
                "Contact support if the problem persists."
            ],
        },

        {
            title: "Network Error",
            reason:
                "Your internet connection may be unstable or our services may be temporarily unreachable.",
            solutions: [
                "Check your internet connection.",
                "Try switching between Wi-Fi and mobile data.",
                "Clear your browser cache and cookies.",
                "Try using another browser or device."
            ],
        },

        {
            title: "Incorrect Email or Password",
            reason:
                "The email address or password provided does not match our records.",
            solutions: [
                "Check that your email address is correct.",
                "Ensure Caps Lock is turned off.",
                "Reset your password if necessary.",
                "Contact support if you cannot access your account."
            ],
        },

        {
            title: "Verification Problems",
            reason:
                "Your account may not have been verified successfully or the verification link may have expired.",
            solutions: [
                "Check your spam or junk email folder.",
                "Request a new verification email.",
                "Ensure you are using the correct email address.",
                "Contact support if the issue persists."
            ],
        },

        {
            title: "Unable to Login",
            reason:
                "Your account may be temporarily restricted or there may be a technical issue preventing access.",
            solutions: [
                "Try logging in after a few minutes.",
                "Reset your password.",
                "Clear your browser cache.",
                "Contact support for further assistance."
            ],
        },
    ],
},

{
    title: "Registration Issues",
    icon: <UserPlus className="text-green-600" />,
    issues: [
        {
            title: "Email Already Exists",
            reason:
                "The email address provided is already associated with an existing account.",
            solutions: [
                "Login using your existing account.",
                "Use the Forgot Password option if necessary.",
                "Register with another email address if appropriate."
            ],
        },

        {
            title: "Phone Number Already Exists",
            reason:
                "The phone number provided has already been used to create an account.",
            solutions: [
                "Login using your existing account.",
                "Use a different phone number if permitted.",
                "Contact support if you believe this is an error."
            ],
        },

        {
            title: "Duplicate Account Detected",
            reason:
                "Our system has detected that similar account information already exists.",
            solutions: [
                "Verify that you have not previously registered.",
                "Use your existing account to login.",
                "Contact support if the account does not belong to you."
            ],
        },

        {
            title: "Unable to Register",
            reason:
                "A technical issue or incomplete information may have prevented registration.",
            solutions: [
                "Ensure all required fields are completed correctly.",
                "Check your internet connection.",
                "Refresh the page and try again.",
                "Contact support if the issue continues."
            ],
        },
    ],
},

  {
    title: "Password Recovery",
    icon: <RefreshCcw className="text-blue-600" />,
    issues: [
        {
            title: "Forgot Password Issues",
            reason:
                "You may not have received the password reset email or entered an incorrect email address.",
            solutions: [
                "Ensure you entered the correct registered email address.",
                "Check your spam or junk folder.",
                "Wait a few minutes before requesting another reset email.",
                "Contact support if you still do not receive the email.",
            ],
        },

        {
            title: "Reset Password Errors",
            reason:
                "The reset process may have failed because of an invalid token or a temporary technical issue.",
            solutions: [
                "Request a new password reset link.",
                "Ensure you are using the latest reset email sent to you.",
                "Try resetting your password from another browser.",
                "Contact support if the problem persists.",
            ],
        },

        {
            title: "Verification Link Expired",
            reason:
                "Password reset links are time-sensitive and may expire after a period of inactivity.",
            solutions: [
                "Request a new password reset email.",
                "Use the latest verification link sent to you.",
                "Avoid using previously generated reset links.",
                "Contact support if you continue experiencing issues.",
            ],
        },

        {
            title: "Password Update Failed",
            reason:
                "Your password may not meet the required security standards or a technical error occurred.",
            solutions: [
                "Ensure your password meets the required length and complexity.",
                "Try using another browser or device.",
                "Refresh the page and try again.",
                "Contact support if the issue continues.",
            ],
        },
    ],
},

{
    title: "Advertisement Approval",
    icon: <Shield className="text-purple-600" />,
    issues: [
        {
            title: "Advertisement Declined",
            reason:
                "Your advertisement may violate our community guidelines or advertisement policies.",
            solutions: [
                "Ensure the advertisement contains accurate information.",
                "Remove prohibited or misleading content.",
                "Resubmit the advertisement after making the necessary changes.",
                "Contact support if you believe it was declined incorrectly.",
            ],
        },

        {
            title: "Advertisement Pending Review",
            reason:
                "All advertisements are manually reviewed before approval to maintain quality and safety.",
            solutions: [
                "Wait for the review process to be completed.",
                "Ensure all required information has been provided.",
                "Avoid submitting duplicate advertisements.",
            ],
        },

        {
            title: "Advertisement Removed",
            reason:
                "Approved advertisements may be removed if they are later found to violate our policies.",
            solutions: [
                "Review our advertisement guidelines carefully.",
                "Remove prohibited content before resubmission.",
                "Contact support for clarification if necessary.",
            ],
        },

        {
            title: "Prohibited Advertisements",
            reason:
                "Advertisements promoting scams, gambling, adult content, fraud or prohibited activities are not permitted.",
            solutions: [
                "Submit only lawful and Halal advertisements.",
                "Ensure your content complies with our platform policies.",
                "Avoid misleading claims or false promotions.",
            ],
        },
    ],
},

{
    title: "Job Profile Approval",
    icon: <UserCheck className="text-green-600" />,
    issues: [
        {
            title: "Profile Pending Approval",
            reason:
                "All Job Creator and Job Finder profiles are reviewed before becoming publicly visible.",
            solutions: [
                "Wait for the review process to be completed.",
                "Ensure all required profile information has been provided.",
                "Avoid submitting duplicate profiles.",
            ],
        },

        {
            title: "Profile Declined",
            reason:
                "Your profile may have violated our policies or contained incomplete information.",
            solutions: [
                "Review the decline reason provided by the administrator.",
                "Update any incorrect or incomplete information.",
                "Resubmit your profile after making the required changes.",
            ],
        },

        {
            title: "Fraudulent Profiles",
            reason:
                "Profiles containing false information, fake identities, or misleading qualifications will not be approved.",
            solutions: [
                "Provide accurate and truthful information.",
                "Upload genuine qualifications and supporting documents.",
                "Avoid impersonating another individual or organization.",
            ],
        },

        {
            title: "Prohibited (Haram) Services",
            reason:
                "Profiles promoting prohibited (Haram), unlawful, or unethical services will be rejected.",
            solutions: [
                "Ensure your services comply with our community guidelines.",
                "Do not promote gambling, fraud, adult content, or other prohibited activities.",
                "Submit only lawful and ethical services.",
            ],
        },

        {
            title: "Profile Information Mismatch",
            reason:
                "The submitted information may not match the uploaded documents or account details.",
            solutions: [
                "Ensure your personal and business information is accurate.",
                "Verify all uploaded documents before submission.",
                "Contact support if you believe an error has occurred.",
            ],
        },
    ],
},
  {
    title: "Prohibited Content",
    icon: (
        <AlertTriangle className="text-red-600" />
    ),
    issues: [
        {
            title: "Gambling or Betting Services",
            reason:
                "Our platform does not permit gambling, betting, lottery, or any form of unlawful financial speculation.",
            solutions: [
                "Remove all gambling-related content before submission.",
                "Promote only lawful and ethical services.",
                "Review our community guidelines before resubmitting.",
            ],
        },

        {
            title: "Adult or Inappropriate Materials",
            reason:
                "Adult, explicit, or inappropriate content is prohibited to maintain a family-friendly environment.",
            solutions: [
                "Remove inappropriate images, videos, or descriptions.",
                "Submit only educational and family-friendly materials.",
                "Ensure your content complies with our policies.",
            ],
        },

        {
            title: "Fraudulent Investment Schemes",
            reason:
                "Fraudulent investments, Ponzi schemes, and misleading financial services are prohibited.",
            solutions: [
                "Provide legitimate business information.",
                "Avoid unrealistic financial promises.",
                "Submit only lawful financial services.",
            ],
        },

        {
            title: "Fake Employment Opportunities",
            reason:
                "Fake jobs or misleading employment advertisements place users at risk.",
            solutions: [
                "Provide accurate job descriptions.",
                "Include genuine employer information.",
                "Avoid requesting unlawful payments from applicants.",
            ],
        },

        {
            title: "Illegal Recruitment Services",
            reason:
                "Recruitment activities that violate applicable laws or deceive users are prohibited.",
            solutions: [
                "Provide legitimate recruitment information.",
                "Avoid misleading employment claims.",
                "Comply with all employment regulations.",
            ],
        },

        {
            title: "Misleading Advertisements",
            reason:
                "Advertisements must accurately represent the products or services being offered.",
            solutions: [
                "Avoid false or exaggerated claims.",
                "Provide accurate descriptions and pricing.",
                "Ensure all promotional materials are truthful.",
            ],
        },

        {
            title: "Haram or Prohibited Services",
            reason:
                "Services that violate our ethical and community standards will not be approved.",
            solutions: [
                "Submit only lawful and Halal services.",
                "Review our prohibited content policies.",
                "Contact support if you require clarification.",
            ],
        },
    ],
},

{
    title: "Report Chats, Channels and Posts",
    icon: <Flag className="text-red-600" />,
    issues: [
        {
            title: "Abusive or Offensive Chats",
            reason:
                "Harassment, threats, and offensive language are prohibited.",
            solutions: [
                "Report abusive users immediately.",
                "Block users when appropriate.",
                "Provide screenshots when contacting support.",
            ],
        },

        {
            title: "Fake Channels",
            reason:
                "Channels impersonating individuals or organizations are prohibited.",
            solutions: [
                "Report suspicious channels immediately.",
                "Avoid interacting with fraudulent accounts.",
                "Provide channel information when reporting.",
            ],
        },

        {
            title: "Inappropriate Posts",
            reason:
                "Posts containing harmful or prohibited content violate our policies.",
            solutions: [
                "Report inappropriate content immediately.",
                "Do not share prohibited materials.",
                "Follow our community guidelines.",
            ],
        },

        {
            title: "Misleading Videos or Harmful Reels",
            reason:
                "Videos and reels must accurately represent their content and must not promote harmful activities.",
            solutions: [
                "Report misleading media content.",
                "Avoid uploading harmful materials.",
                "Submit only educational and lawful content.",
            ],
        },

        {
            title: "Spam and Harassment",
            reason:
                "Repeated unwanted messages or targeted harassment negatively affect our community.",
            solutions: [
                "Report spam accounts immediately.",
                "Block abusive users.",
                "Contact support if harassment continues.",
            ],
        },

        {
            title: "Copyright Violations",
            reason:
                "Uploading copyrighted materials without authorization is prohibited.",
            solutions: [
                "Upload only original or licensed content.",
                "Provide proof of ownership if required.",
                "Remove copyrighted materials immediately.",
            ],
        },

        {
            title: "Illegal or Prohibited Content",
            reason:
                "Illegal activities or prohibited materials are not permitted on our platform.",
            solutions: [
                "Report prohibited content immediately.",
                "Avoid sharing unlawful materials.",
                "Comply with our community guidelines.",
            ],
        },
    ],
},

{
    title: "Fake Identity & Fraud",
    icon: (
        <ShieldAlert className="text-red-600" />
    ),
    issues: [
        {
            title: "Fake Teacher Profiles",
            reason:
                "Impersonating teachers or submitting false qualifications is prohibited.",
            solutions: [
                "Report suspicious profiles immediately.",
                "Verify teacher information before making payments.",
                "Contact support for further investigation.",
            ],
        },

        {
            title: "Fake Student Accounts",
            reason:
                "Students using false identities may endanger other members of the community.",
            solutions: [
                "Report suspicious behavior immediately.",
                "Avoid sharing sensitive information.",
                "Block fraudulent users whenever necessary.",
            ],
        },

        {
            title: "Fraudulent Transactions",
            reason:
                "Unauthorized or deceptive transactions violate our policies.",
            solutions: [
                "Report suspicious payments immediately.",
                "Keep your transaction records.",
                "Contact support for assistance.",
            ],
        },

        {
            title: "Fake Certificates or Qualifications",
            reason:
                "Submitting false educational or professional documents is prohibited.",
            solutions: [
                "Provide genuine documentation only.",
                "Report suspicious qualifications.",
                "Avoid falsifying credentials.",
            ],
        },

        {
            title: "Scam Job Advertisements",
            reason:
                "Fraudulent employment opportunities will not be approved.",
            solutions: [
                "Provide accurate employment information.",
                "Avoid requesting unlawful payments.",
                "Report suspicious advertisements immediately.",
            ],
        },

        {
            title: "Account Impersonation",
            reason:
                "Pretending to be another individual or organization is prohibited.",
            solutions: [
                "Verify account details before interacting.",
                "Report impersonation immediately.",
                "Contact support if your account has been impersonated.",
            ],
        },
    ],
},

{
    title: "Product Approval Policy",
    icon: (
        <PackageCheck className="text-green-600" />
    ),
    issues: [
        {
            title: "Halal Products Only",
            reason:
                "All products must comply with our ethical and Halal policies.",
            solutions: [
                "Submit only lawful and permissible products.",
                "Review our product guidelines before submission.",
                "Avoid prohibited items.",
            ],
        },

        {
            title: "Prohibited Products",
            reason:
                "Products involving gambling, fraud, adult materials, or illegal activities are prohibited.",
            solutions: [
                "Remove prohibited materials immediately.",
                "Ensure all products comply with our policies.",
                "Submit only approved product categories.",
            ],
        },

        {
            title: "Misleading Product Information",
            reason:
                "Products must accurately describe what is being offered.",
            solutions: [
                "Provide accurate descriptions and images.",
                "Avoid false advertising.",
                "Include complete product information.",
            ],
        },

        {
            title: "Fraudulent Services",
            reason:
                "Products or services intended to deceive users will not be approved.",
            solutions: [
                "Provide legitimate business information.",
                "Avoid misleading claims.",
                "Contact support for clarification when necessary.",
            ],
        },

        {
            title: "Rejected Products",
            reason:
                "Products may be rejected if they violate our community guidelines or policies.",
            solutions: [
                "Review the rejection notice carefully.",
                "Update the product information if required.",
                "Resubmit the product after making the necessary changes.",
            ],
        },
    ],
},

{
    title: "Badges Issues",
    icon: <Award className="text-yellow-500" />,
    issues: [
        {
            title:
                "Badges were deducted but the request was unsuccessful.",
            reason:
                "A network error or transaction failure may have occurred after your badges were deducted.",
            solutions: [
                "Refresh the page and check your badge balance.",
                "Wait a few minutes for synchronization to complete.",
                "Review your badge history for recent transactions.",
                "Contact support if your badges are not restored automatically.",
            ],
        },

        {
            title:
                "Badges were deducted multiple times.",
            reason:
                "Multiple submissions or temporary system delays may cause duplicate deductions.",
            solutions: [
                "Avoid clicking the submit button repeatedly.",
                "Check your badge transaction history.",
                "Contact support immediately if duplicate deductions occur.",
            ],
        },

        {
            title: "Unable to Unlock Proposals",
            reason:
                "You may not have sufficient badges or the unlocking request may not have been completed successfully.",
            solutions: [
                "Verify that you have the required number of badges.",
                "Refresh the page and try again.",
                "Wait a few minutes before submitting another request.",
                "Contact support if the issue persists.",
            ],
        },

        {
            title: "Badge Balance is Incorrect",
            reason:
                "Your badge balance may not have synchronized properly after recent activities.",
            solutions: [
                "Logout and login again.",
                "Refresh your profile page.",
                "Review your badge history for recent changes.",
                "Contact support if the balance remains incorrect.",
            ],
        },

        {
            title:
                "Rewards were not added successfully.",
            reason:
                "Badge rewards may be delayed because of a processing issue.",
            solutions: [
                "Wait a few minutes for the rewards to appear.",
                "Refresh the page.",
                "Verify that the required task was completed successfully.",
                "Contact support if the rewards are still missing.",
            ],
        },

        {
            title: "Badge History is Missing",
            reason:
                "Temporary synchronization issues may prevent your badge history from displaying correctly.",
            solutions: [
                "Refresh the page.",
                "Logout and login again.",
                "Wait a few minutes and try again.",
                "Contact support if the issue continues.",
            ],
        },

        {
            title: "Unable to Use Badges",
            reason:
                "The selected feature may require additional badges or there may be a temporary system issue.",
            solutions: [
                "Ensure you have sufficient badges.",
                "Verify that the feature supports badge usage.",
                "Refresh the page before attempting again.",
                "Contact support if badges cannot be used.",
            ],
        },
    ],
},

{
    title: "Community & Channel Issues",
    icon: (
        <MessagesSquare className="text-purple-600" />
    ),
    issues: [
        {
            title: "Unable to Create a Channel",
            reason:
                "The submitted information may be incomplete or your account may not currently meet the requirements.",
            solutions: [
                "Ensure all required fields have been completed.",
                "Refresh the page and try again.",
                "Verify that your account has the necessary permissions.",
                "Contact support if the problem persists.",
            ],
        },

        {
            title: "Unable to Upload Videos",
            reason:
                "The file size, format, or network connection may prevent successful uploads.",
            solutions: [
                "Check that the video format is supported.",
                "Ensure the file size is within the permitted limit.",
                "Verify your internet connection.",
                "Try uploading the file again.",
            ],
        },

        {
            title: "Unable to Upload Reels",
            reason:
                "The reel may exceed the permitted duration or file size limitations.",
            solutions: [
                "Reduce the file size if necessary.",
                "Verify that the reel complies with our guidelines.",
                "Refresh the page before attempting another upload.",
                "Contact support if uploads continue to fail.",
            ],
        },

        {
            title: "Post Creation Problems",
            reason:
                "Your post may contain prohibited content or a temporary system error may have occurred.",
            solutions: [
                "Ensure the post complies with our community guidelines.",
                "Remove prohibited or inappropriate content.",
                "Refresh the page and submit the post again.",
            ],
        },

        {
            title: "Community Access Issues",
            reason:
                "You may not currently have permission to access the selected community.",
            solutions: [
                "Verify that you have joined the community.",
                "Refresh the page and try again.",
                "Contact support if access problems continue.",
            ],
        },

        {
            title:
                "Report Inappropriate Communities",
            reason:
                "Communities promoting harmful, fraudulent, or prohibited activities violate our policies.",
            solutions: [
                "Report inappropriate communities immediately.",
                "Provide screenshots or additional details when reporting.",
                "Avoid engaging with prohibited communities.",
            ],
        },

        {
            title: "Report Spam Channels",
            reason:
                "Spam channels may distribute misleading or unwanted content to users.",
            solutions: [
                "Report spam channels immediately.",
                "Block suspicious accounts whenever necessary.",
                "Contact support if spam activities continue.",
            ],
        },

        {
            title: "Report Videos, Posts and Reels",
            reason:
                "Videos, posts, and reels that violate our policies should be reported immediately.",
            solutions: [
                "Report harmful or misleading content.",
                "Report copyrighted materials that have been uploaded without authorization.",
                "Provide screenshots whenever possible.",
                "Contact support if urgent action is required.",
            ],
        },
    ],
},

{
    title: "Halal Advertisement & Sponsorship Policy",
    icon: (
        <BadgeDollarSign className="text-emerald-600" />
    ),
    issues: [
        {
            title: "Approved Advertisements",
            reason:
                "Our platform only approves lawful, ethical, and Halal advertisements that provide value to our community.",

            solutions: [
                "Educational products and services are permitted.",
                "Halal businesses and services are welcome.",
                "Technology and software products may be promoted.",
                "Employment and freelancing opportunities are allowed.",
                "Books, courses, and learning materials are permitted.",
                "Professional and business services are acceptable.",
                "Family-friendly products are encouraged.",
                "Sponsored posts, videos, reels, and channels must comply with our policies.",
            ],
        },

        {
            title: "Prohibited Advertisements",
            reason:
                "Advertisements promoting Haram, unlawful, or harmful activities will not be approved.",

            solutions: [
                "Do not submit gambling or betting advertisements.",
                "Adult or inappropriate materials are prohibited.",
                "Alcohol and prohibited substances are not permitted.",
                "Fraudulent investment schemes are prohibited.",
                "Fake employment opportunities will be rejected.",
                "Ponzi and pyramid schemes are not allowed.",
                "Copyright-infringing materials are prohibited.",
                "Misleading or deceptive advertisements will not be approved.",
                "Illegal products or services are prohibited.",
                "Advertisements promoting Haram activities are not permitted.",
            ],
        },

        {
            title: "Advertisement Review Status",
            reason:
                "Every advertisement is reviewed before becoming publicly visible on our platform.",

            solutions: [
                "Pending Review – Your advertisement is awaiting approval.",
                "Approved – Your advertisement has been approved successfully.",
                "Declined – Your advertisement violates one or more platform policies.",
                "Suspended – Your advertisement has been temporarily restricted.",
                "Removed – Your advertisement has been permanently removed from the platform.",
            ],
        },

        {
            title: "Reasons for Advertisement Rejection",
            reason:
                "Advertisements may be rejected when they fail to comply with our community guidelines and sponsorship policies.",

            solutions: [
                "Incomplete or inaccurate information was submitted.",
                "Fraudulent or suspicious activities were detected.",
                "The advertisement violates our community guidelines.",
                "False or misleading claims were identified.",
                "The content promotes prohibited or Haram activities.",
                "The advertisement presents safety concerns for our users.",
            ],
        },

        {
            title: "Sponsored Content Policy",
            reason:
                "All sponsored posts, videos, reels, advertisements, and channels must undergo moderation before approval.",

            solutions: [
                "Sponsored content must be truthful and transparent.",
                "Only lawful and ethical sponsorships are permitted.",
                "Sponsored materials must accurately represent the products or services being offered.",
                "Advertisements intended to deceive or exploit users will be rejected.",
                "Repeated policy violations may result in account restrictions or suspension.",
            ],
        },

        {
            title: "Before Submitting an Advertisement",
            reason:
                "Reviewing your submission beforehand helps prevent unnecessary delays or rejection.",

            solutions: [
                "Ensure all information provided is accurate.",
                "Verify that your products and services comply with our Halal policies.",
                "Avoid misleading descriptions and exaggerated claims.",
                "Submit only original and authorized promotional materials.",
                "Contact support if you are uncertain whether your advertisement is permissible.",
            ],
        },
    ],
}
];

return(
    <div className="mt-6">

    <h2 className="text-xl font-bold mb-2">
        Frequently Reported Issues
    </h2>

    <div className="flex flex-col gap-2">

    {accordions.map((item, index) => (

        <div
            key={index}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >

            {/* Main Header */}

            <button
                onClick={() =>
                    toggleAccordion(index)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all"
            >

                <div className="flex items-center gap-4">

                    {item.icon}

                    <h2 className="font-bold text-lg text-left">
                        {item.title}
                    </h2>

                </div>

                {activeAccordion === index ? (
                    <ChevronUp size={22} />
                ) : (
                    <ChevronDown size={22} />
                )}

            </button>


            {/* Main Body */}

            <div
                className={`transition-all duration-500 overflow-hidden
                ${
                    activeAccordion === index
                        ? "max-h-[700px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >

                <div className="p-6 space-y-4 overflow-y-auto max-h-[500px] scrollbar-thin">

                    {item.issues?.map(
                        (issue, issueIndex) => {

                            const key =
                                `${index}-${issueIndex}`;

                            return (

                                <div
                                    key={issueIndex}
                                    className="border rounded-xl"
                                >

                                    {/* Issue Header */}

                                    <button
                                        onClick={() =>
                                            toggleIssue(
                                                index,
                                                issueIndex
                                            )
                                        }
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                                    >

                                        <h3 className="font-semibold text-left">
                                            {issue.title}
                                        </h3>

                                        {activeIssue[
                                            key
                                        ] ? (
                                            <ChevronUp
                                                size={
                                                    18
                                                }
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={
                                                    18
                                                }
                                            />
                                        )}

                                    </button>


                                    {/* Issue Body */}

                                    <div
                                        className={`transition-all duration-500 overflow-hidden
                                        ${
                                            activeIssue[
                                                key
                                            ]
                                                ? "max-h-[500px] opacity-100"
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >

                                        <div className="px-4 pb-4 space-y-4">

                                            {/* Reason */}

                                            <div>

                                                <h4 className="font-bold text-black mb-2">
                                                    Reason
                                                </h4>

                                                <p className="text-gray-600">
                                                    {
                                                        issue.reason
                                                    }
                                                </p>

                                            </div>


                                            {/* Solutions */}

                                            <div>

                                                <h4 className="font-bold text-black mb-2">
                                                    Possible
                                                    Solutions
                                                </h4>

                                                <ul className="list-disc ml-5 space-y-2 text-gray-600">

                                                    {issue.solutions?.map(
                                                        (
                                                            solution,
                                                            solutionIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    solutionIndex
                                                                }
                                                            >
                                                                {
                                                                    solution
                                                                }
                                                            </li>
                                                        )
                                                    )}

                                                </ul>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );
                        }
                    )}

                </div>

            </div>

        </div>

    ))}

</div>

</div>
)

}