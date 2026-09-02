
import 'package:flutter/material.dart';

void main() {
  runApp(const AyoBangunApp());
}

class AyoBangunApp extends StatelessWidget {
  const AyoBangunApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ayo Bangun.ID Contractor',
      theme: ThemeData.dark(),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Text('Ayo Bangun.ID Contractor'),
            Text('Construction Management System'),
          ],
        ),
      ),
    );
  }
}
