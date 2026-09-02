
import 'package:flutter/material.dart';

void main() {
 runApp(const AyoBangunApp());
}

class AyoBangunApp extends StatelessWidget {
 const AyoBangunApp({super.key});

 @override
 Widget build(BuildContext context){
  return MaterialApp(
   debugShowCheckedModeBanner:false,
   title:'Ayo Bangun.ID Contractor',
   theme:ThemeData(
    brightness:Brightness.dark,
    colorSchemeSeed:const Color(0xffc89b3c),
   ),
   home:const DashboardPage(),
  );
 }
}

class DashboardPage extends StatelessWidget{
 const DashboardPage({super.key});

 @override
 Widget build(BuildContext context){
  return Scaffold(
   appBar:AppBar(title:const Text('Ayo Bangun.ID Contractor')),
   body:GridView.count(
    padding:const EdgeInsets.all(16),
    crossAxisCount:2,
    children:[
     card('Project'),
     card('Material'),
     card('Stock'),
     card('Absensi'),
     card('Progress'),
     card('Laporan')
    ],
   ),
  );
 }

 Widget card(String text){
  return Card(
   child:Center(child:Text(text))
  );
 }
}
