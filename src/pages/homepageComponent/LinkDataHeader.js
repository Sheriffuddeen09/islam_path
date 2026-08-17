import {
Store, Tv, Megaphone, Download, HeartHandshake, ShieldCheck,
Phone, BookOpen, ScrollText, MoonStar, Scale, Languages, Library, 
Compass, Clock3, GraduationCap, Bookmark, NotebookPen, BookMarked, 
Gem,
ArrowDownLeftSquareIcon, } from "lucide-react";
export const linkList = [
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
icon: <BookOpen />, 
name: "Quran Download", 
link: "/quran", 
background: "bg-black", },
{
id: 5, 
icon: <Tv />, name: "Video", // Opens popup/modal
link: "/video", 
background: "bg-gray-900", },
{
id: 6, 
icon: <Megaphone />, 
name: "Advertisement / Sponsorship", 
toggle: true,  
background: "bg-pink-900", }, 
, 
{
id: 8, 
icon: <ArrowDownLeftSquareIcon />, 
name: "Cart", 
link: "/cart", 
background: "bg-pink-900", },
{
id: 9, 
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
id: 10, 
icon: <HeartHandshake />, 
name: "About", 
link: "/about", background: "bg-yellow-900", },{
id: 11, icon: <ShieldCheck />, name: "Privacy Policy", link: "/privacy", background: "bg-blue-900", },{
id: 12, icon: <Phone />, name: "Contact Us", link: "/contact-us", background: "bg-indigo-900", }
]

export const islamicApps = [
{
id: 1, icon: <BookOpen />, name: "Al Quran",
link: "", },{
id: 2, icon: <ScrollText />, name: "Hadith Collection", link: "", },{
id: 3, icon: <MoonStar />, name: "Muslim Pro", link: "", },{
id: 4, icon: <Scale />, name: "Fiqh", link: "", },{
id: 5, icon: <Languages />, name: "Arabiyya", link: "", },{
id: 6, icon: <Library />,
name: "Usul Ath-Thalatha", link: "", },{
id: 7, icon: <Compass />, name: "Qiblah Finder", link: "", },{
id: 8, icon: <Clock3 />, name: "Prayer Times", link: "", },{
id: 9, icon: <GraduationCap />, name: "Arabic Dictionary", link: "", },{
id: 10, icon: <Bookmark />, name: "Hisnul Muslim", link: "", },{
id: 11,
icon: <NotebookPen />, name: "Easy Quran Hafiz", link: "", },{
id: 12, icon: <BookMarked />, name: "Tafsiir Quran", link: "", },{
id: 13, icon: <Gem />, name: "40 Hadith An-Nawawi", link: "", }, ];