import React from "react";
import {
    Shield,
    Lock,
    Users,
    Eye,
    Database,
    Cookie,
    BadgeDollarSign,
    Briefcase,
    MessageCircle,
    AlertTriangle,
    UserCheck,
    Globe,
    Mail,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {

    const navigate = useNavigate()
    const sections = [
        {
            icon: <Shield className="text-blue-600" />,
            title: "Information We Collect",
            description: (
                <>
                    <p>
                        We may collect information that you voluntarily
                        provide when creating an account, posting jobs,
                        applying for jobs, submitting advertisements,
                        communicating with other users, or contacting our
                        support team.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>Name and email address.</li>
                        <li>Phone number.</li>
                        <li>Location information.</li>
                        <li>Job profile information.</li>
                        <li>Uploaded documents and media files.</li>
                        <li>Products and advertisements submitted.</li>
                        <li>Community and channel activities.</li>
                    </ul>
                </>
            ),
        },

        {
            icon: <Database className="text-green-600" />,
            title: "How We Use Your Information",
            description: (
                <>
                    <p>
                        Your information is used to improve our services,
                        provide support, maintain platform security and
                        deliver a better experience.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>Create and manage your account.</li>
                        <li>Verify submitted profiles.</li>
                        <li>Provide customer support.</li>
                        <li>Prevent fraud and abuse.</li>
                        <li>Improve our services.</li>
                        <li>Review advertisements and sponsored content.</li>
                        <li>Protect our users and communities.</li>
                    </ul>
                </>
            ),
        },

        {
            icon: <Cookie className="text-yellow-600" />,
            title: "Cookies & Analytics",
            description: (
                <>
                    <p>
                        We may use cookies and analytics technologies to
                        understand how users interact with our platform.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>Remember login sessions.</li>
                        <li>Improve website performance.</li>
                        <li>Understand user preferences.</li>
                        <li>Provide relevant advertisements.</li>
                        <li>Maintain security measures.</li>
                    </ul>
                </>
            ),
        },

        {
            icon: (
                <BadgeDollarSign className="text-emerald-600" />
            ),
            title: "Advertisements & Sponsored Content",
            description: (
                <>
                    <p>
                        All advertisements, sponsorships and promotional
                        materials submitted to our platform are reviewed
                        before approval.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>
                            Advertisements must comply with applicable
                            laws and our policies.
                        </li>

                        <li>
                            Fraudulent or misleading advertisements are
                            prohibited.
                        </li>

                        <li>
                            Adult, gambling and unlawful advertisements
                            are not permitted.
                        </li>

                        <li>
                            Sponsored content must clearly represent what
                            is being offered.
                        </li>

                        <li>
                            We reserve the right to remove or reject any
                            advertisement that violates our policies.
                        </li>
                    </ul>
                </>
            ),
        },

        {
            icon: <Briefcase className="text-indigo-600" />,
            title: "Job Profiles & Employment Services",
            description: (
                <>
                    <p>
                        Job Creator and Job Finder profiles are reviewed
                        before approval.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>Profiles may require verification.</li>

                        <li>
                            Fraudulent employment opportunities are
                            prohibited.
                        </li>

                        <li>
                            Fake job postings will be removed
                            immediately.
                        </li>

                        <li>
                            Users may be suspended for violating our
                            employment policies.
                        </li>

                        <li>
                            Profile approval is required before accessing
                            certain job-related services.
                        </li>
                    </ul>
                </>
            ),
        },

        {
            icon: (
                <MessageCircle className="text-purple-600" />
            ),
            title: "Community, Channels & Posts",
            description: (
                <>
                    <p>
                        Users are responsible for the content they share
                        within communities, channels, posts, reels and
                        videos.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>No harassment or bullying.</li>
                        <li>No spam or misleading content.</li>
                        <li>No hate speech.</li>
                        <li>No illegal activities.</li>
                        <li>
                            Users may report inappropriate content.
                        </li>
                    </ul>
                </>
            ),
        },

        {
            icon: <Lock className="text-blue-600" />,
            title: "Data Security",
            description: (
                <>
                    <p>
                        We implement reasonable security measures to
                        protect user information from unauthorized access,
                        disclosure and misuse.
                    </p>

                    <p className="mt-3">
                        While we strive to protect your information, no
                        method of electronic transmission is completely
                        secure.
                    </p>
                </>
            ),
        },

        {
            icon: <UserCheck className="text-green-600" />,
            title: "User Responsibilities",
            description: (
                <>
                    <ul className="list-disc ml-5 space-y-2">
                        <li>Provide accurate information.</li>

                        <li>
                            Protect your account credentials.
                        </li>

                        <li>
                            Respect other members of the platform.
                        </li>

                        <li>
                            Avoid fraudulent or misleading activities.
                        </li>

                        <li>
                            Comply with our policies and community
                            guidelines.
                        </li>
                    </ul>
                </>
            ),
        },

        {
            icon: (
                <AlertTriangle className="text-red-600" />
            ),
            title: "Account Suspension & Termination",
            description: (
                <>
                    <p>
                        Accounts may be suspended or permanently banned
                        when users engage in activities that violate our
                        policies.
                    </p>

                    <ul className="list-disc ml-5 mt-3 space-y-2">
                        <li>Fraudulent activities.</li>
                        <li>Fake identities.</li>
                        <li>Illegal services.</li>
                        <li>Spam or abuse.</li>
                        <li>Copyright infringement.</li>
                        <li>Misleading advertisements.</li>
                        <li>Repeated policy violations.</li>
                    </ul>
                </>
            ),
        },

        {
            icon: <Globe className="text-blue-600" />,
            title: "Third-Party Services",
            description: (
                <>
                    <p>
                        We may integrate trusted third-party services for
                        payments, analytics, authentication, cloud
                        storage and advertisements.
                    </p>

                    <p className="mt-3">
                        These services maintain their own privacy policies
                        and practices.
                    </p>
                </>
            ),
        },

        {
            icon: <Users className="text-green-600" />,
            title: "Children's Privacy",
            description: (
                <>
                    <p>
                        Our services are not intended for children who
                        are prohibited from creating accounts under
                        applicable laws. We do not knowingly collect
                        personal information from children without proper
                        authorization.
                    </p>
                </>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 bg-[var(--bg-color)] text-[var(--text-color)] ">

            {/* Header */}

            
            <div className="text-center border sm:px-3 sm:py-6 p-2 mt-12 mb-4 rounded-xl shadow-xl">

                    <h1 className="sm:text-2xl text-xl font-bold">
                        Privacy Policy
                    </h1>

                    <p className="text-sm mt-4 max-w-6xl mx-auto leading-7">
                        We are committed to protecting your privacy, promoting lawful and
                        ethical services, and maintaining a safe and trusted environment for
                        our users and community. This Privacy Policy explains how we collect,
                        use, store, and safeguard your personal information when you use our
                        platform.
                        By accessing or using our services, you agree to the practices
                        described in this policy. We collect only the information necessary to
                        provide and improve our services, facilitate communication between
                        users, enhance security, and comply with applicable legal obligations.
                        We implement reasonable security measures to protect your data from
                        unauthorized access, misuse, disclosure, or alteration. We are also
                        committed to respecting your choices regarding your personal
                        information and ensuring transparency in how your data is handled.
                        Our goal is to foster a professional, secure, and inclusive platform
                        where users can confidently engage with the services we provide. We
                        encourage you to review this Privacy Policy carefully and contact us
                        if you have any questions or concerns regarding your privacy.
                    </p>

                    </div>


            {/* Halal Policy */}

            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 shadow-lg mb-4">

                <div className="flex items-center gap-3 mb-4">

                    <CheckCircle2
                        size={32}
                        className="text-emerald-600"
                    />

                    <h2 className="text-2xl font-bold text-emerald-600">
                        Ethical & Halal Platform Policy
                    </h2>

                </div>

                <p className="text-gray-900 text-sm leading-6">
                    Our platform promotes lawful, ethical and Halal
                    services that support education, professional
                    development and beneficial opportunities for our
                    users. We reserve the right to reject, remove,
                    suspend or permanently ban accounts, advertisements,
                    products, communities or sponsored content that
                    promote fraud, illegal activities, gambling, adult
                    materials or other prohibited services.
                </p>

            </div>

            

            {/* Sections */}

            <div className="grid lg:grid-cols-2 gap-3">

                {sections.map((section, index) => (

                    <div
                        key={index}
                        className="rounded-3xl shadow-lg sm:p-6 p-3 border-blue-300 border"
                    >
                        <div className="flex gap-3 mb-5">

                            {section.icon}

                            <h2 className="text-xl font-bold">
                                {section.title}
                            </h2>

                        </div>

                        <div className="text-sm leading-6">
                            {section.description}
                        </div>

                    </div>

                ))}

            </div>


            {/* Contact */}

            <div className="mt-4 rounded-3xl border border-blue-200  px-8 pb-16 pt-6 shadow-lg">

                <div className="flex items-center gap-3 mb-2">

                    <Mail className="text-blue-600" />

                    <h2 className="text-2xl font-bold">
                        Contact Us
                    </h2>

                </div>

                <p className="leading-6">
                    If you have questions regarding this Privacy Policy,
                    advertisements, sponsorships, account security or
                    your personal information, please contact our support
                    team through the platform's support page.
                </p>
                
            <button onClick={() => navigate('/contact-us')} className="bg-black hover-bg-gray-900
            text-white rounded-lg px-3 py-2 float-right mb-6">
                Contact Us
            </button>
            </div>


        </div>
    );
}