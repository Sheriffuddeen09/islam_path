import {
Store, Tv, Megaphone, Download, HeartHandshake, ShieldCheck,
Phone, BookOpen, ScrollText, MoonStar, Scale, Languages, Library, 
Compass, Clock3, GraduationCap, Bookmark, NotebookPen, BookMarked, 
Gem,
ArrowDownLeftSquareIcon, CarFront, Smartphone} from "lucide-react";
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
icon: <CarFront />, 
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
icon: <Smartphone />, 
name: "App", 
appSite: true, background: "bg-yellow-900", }, 
{id: 11, 
icon: <HeartHandshake />, 
name: "About", 
link: "/about", background: "bg-yellow-900", },
{
id: 12, icon: <ShieldCheck />, name: "Privacy Policy", link: "/privacy", background: "bg-blue-900", },{
id: 13, icon: <Phone />, name: "Contact Us", link: "/contact-us", background: "bg-indigo-900", }
]

export const islamicApps = [
{
id: 1, icon: <BookOpen />, name: "Al Quran",
link: "https://play.google.com/store/apps/details?id=com.greentech.quran", },{
id: 2, icon: <ScrollText />, name: "Hadith Collection", link: "https://play.google.com/store/apps/details?id=com.greentech.hadith", },{
id: 3, icon: <MoonStar />, name: "Muslim Pro", link: "https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro", },{
id: 4, icon: <Scale />, name: "Fiqh", link: "https://play.google.com/store/apps/details?id=com.bidayat.motafa9ih", },{
id: 5, icon: <Languages />, name: "Arabiyya", link: "https://play.google.com/store/apps/details?id=id.azhar.jamiuddurusarabiyyah", },{
id: 6, icon: <Library />,
name: "Usul Ath-Thalatha", link: "https://play.google.com/store/apps/details?id=com.limo.tsaqqova", },{
id: 7, icon: <Clock3 />, name: "Prayer Times", link: "https://play.google.com/store/apps/details?id=com.greentech.sadiq", },{
id: 8, icon: <GraduationCap />, name: "Arabic Dictionary", link: "https://play.google.com/store/apps/details?id=epic.arabic.translator", },{
id: 9, icon: <Bookmark />, name: "Hisnul Muslim", link: "https://play.google.com/store/apps/details?id=com.admads.android.HisnulMuslim_Google_JQM", },{
id: 10,
icon: <NotebookPen />, name: "Easy Quran Hafiz", link: "https://play.google.com/store/apps/details?id=com.qabir.easyquranhafiz", },{
id: 11, icon: <BookMarked />, name: "Tafsiir Quran", link: "https://play.google.com/store/apps/details?id=com.simppro.quran.tafseer.offline", },{
id: 12, icon: <Gem />, name: "40 Hadith An-Nawawi", link: "https://play.google.com/store/apps/details?id=com.chaks.nawawi", }, ];

 
 
