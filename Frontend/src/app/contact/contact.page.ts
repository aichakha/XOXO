import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ContactPage implements OnInit {

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  message: string = '';

  constructor(private alertController: AlertController, private router: Router) {} // Injection correcte de Router

  async sendMessage() {
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.message) {
      this.showAlert('Error', 'Please fill in all fields.');
      return;
    }

    console.log('Message Sent:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      message: this.message
    });

    this.showAlert('Success', 'Your message has been sent successfully!');
    this.resetForm();
  }

  resetForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.message = '';
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  Home() {
    this.router.navigate(['/acceuil']); // Navigation fonctionnelle
  }

  Contact() {
    this.router.navigate(['/contact']); // Navigation fonctionnelle
  }

  ngOnInit() {}
}
