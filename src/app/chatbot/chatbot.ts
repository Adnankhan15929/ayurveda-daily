import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
  isOpen = false;
  loading = false;
  userInput = '';
  messages: { role: string; text: string }[] = [
    { role: 'bot', text: 'Namaste! Ask me anything about Ayurveda 🌿' },
  ];
  history: { role: string; content: string }[] = [];

  suggestions = [
    'What is Ashwagandha used for?',
    'Home remedies for cold?',
    'Benefits of turmeric?',
    'Foods for better digestion?',
  ];

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  ask(question: string) {
    if (this.loading) return;
    this.userInput = question;
    this.send();
  }

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return; // ✅ guard at the TOP

    this.messages.push({ role: 'user', text });
    this.history.push({ role: 'user', content: text });
    this.userInput = '';
    this.loading = true;

    const snapshot = this.history.map(m => ({ ...m })); // ✅ snapshot before async

    this.http.post<any>('http://localhost:3000/chat', { messages: snapshot }).subscribe({
      next: (res) => {
        const reply = res.content[0].text;
        this.messages.push({ role: 'bot', text: reply });
        this.history.push({ role: 'assistant', content: reply });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'bot', text: 'Sorry, something went wrong. Please try again!' });
        this.history.pop(); // ✅ clean up failed message from history
        this.loading = false;
      },
    });
    // ✅ NOTHING after this — no extra code below the subscribe
  }
}