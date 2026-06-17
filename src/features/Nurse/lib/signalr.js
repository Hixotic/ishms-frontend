import * as signalR from '@microsoft/signalr';
import { usePatientStore, useAlertStore } from '@/store/useStore';

class SignalRService {
  constructor() {
    this.connection = null;
  }

  async start() {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/nursing')
      .withAutomaticReconnect()
      .build();

    this.connection.on('PatientStatusUpdated', (patientId, status) => {
      usePatientStore.getState().updatePatientStatus(patientId, status);
    });

    this.connection.on('NewAlert', (alert) => {
      useAlertStore.getState().addAlert(alert);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    }
  }

  stop() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
