import {
Store, Tv, Megaphone, Download, HeartHandshake, ShieldCheck,
Phone, BookOpen, ScrollText, MoonStar, Scale, Languages, Library, 
Compass, Clock3, GraduationCap, Bookmark, NotebookPen, BookMarked, 
Gem, ArrowDownLeftSquareIcon} from "lucide-react";
export const linkList = [
{
id: 1, icon: <Store />,
name: "Market Page", 
link: "/online-sale", 
},
{
id: 2, icon: <Store />,
name: "Market Page", 
link: "/online-sale", 
},
{
id: 3, 
icon: <GraduationCap />, 
name: "Get Mentor", 
link: "/get-mentor", 
role: "student", // Only students can see this
background: "bg-black", },
{
id: 4, 
icon: <Tv />, 
name: "Video",
link: "/post/video", 
background: "bg-gray-900", },
{
id: 5, 
icon: <Megaphone />, 
name: "Advertisement / Sponsorship", 
toggle: true, 
background: "bg-pink-900", }, 
, 
{
id: 6, 
icon: <ArrowDownLeftSquareIcon />, 
name: "WishList", 
link: "/wishlist", 
background: "bg-pink-900", },
{ 
id: 7, 
icon: <Download />, 
name: "App Download", 
appDownload: true,
background: "bg-green-900", },
{
id: 8, 
icon: <HeartHandshake />, 
name: "About", 
link: "/about", background: "bg-yellow-900", },{
id: 9, icon: <ShieldCheck />, name: "Privacy Policy", link: "/privacy", background: "bg-blue-900", },{
id: 10, icon: <Phone />, name: "Contact Us", link: "/contact-us", background: "bg-indigo-900", }
]

export const islamicApps = [
{
id: 1, icon: <BookOpen />, name: "Al Quran",
link: "https://apps.microsoft.com/detail/9P1ZD3K91XQT?hl=en-us&gl=US&ocid=pdpshare", },{
id: 2, icon: <ScrollText />, name: "Hadith Collection", link: "https://apps.microsoft.com/detail/9PC5GTQRCFGB?hl=en-us&gl=US&ocid=pdpshare", },{
id: 3, icon: <MoonStar />, name: "Muslim Pro", link: "https://apps.microsoft.com/detail/9WZDNCRDT1DQ?hl=en&gl=US&ocid=pdpshare", },{
id: 4, icon: <Scale />, name: "Fiqh", link: "https://apps.microsoft.com/detail/9N4S78P86PKX?hl=neutral&gl=US&ocid=pdpshare", },{
id: 5, icon: <Languages />, name: "Arabiyya", link: "https://apps.microsoft.com/detail/9N4S78P86PKX?hl=neutral&gl=US&ocid=pdpshare", },{
id: 6, icon: <Library />,
name: "Usul Ath-Thalatha", link: "https://salaficentre.com/wp-content/uploads/2016/04/Usool-at-Thalaatha-Full-Workbook-WEB.pdf", },
{
id: 7, icon: <Clock3 />, name: "Prayer Times", link: "https://apps.microsoft.com/detail/9NRXZ1PSXZRV?hl=en&gl=US&ocid=pdpshare", },{
id: 8, icon: <GraduationCap />, name: "Arabic Dictionary", link: "https://apps.microsoft.com/detail/9WZDNCRDC1LB?hl=en-us&gl=US&ocid=pdpshare", },{
id: 9, icon: <Bookmark />, name: "Hisnul Muslim", link: "https://hisnul-muslim-plus.updatestar.com/download", },{
id: 10,
icon: <NotebookPen />, name: "Easy Quran Hafiz", link: "https://apps.microsoft.com/detail/9WZDNCRDF9MB?hl=en-us&gl=US&ocid=pdpshare", },{
id: 11, icon: <BookMarked />, name: "Tafsiir Quran", link: "https://apps.microsoft.com/detail/9NX2CHFQ26GD?hl=en-us&gl=US&ocid=pdpshare", },{
id: 12, icon: <Gem />, name: "40 Hadith An-Nawawi", link: "https://apps.microsoft.com/detail/9WZDNCRDD6DL?hl=neutral&gl=US&ocid=pdpshare", }, ];