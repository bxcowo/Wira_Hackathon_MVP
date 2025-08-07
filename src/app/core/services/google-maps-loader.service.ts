import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private static promise: Promise<any>;

  public load(): Promise<any> {
    if (GoogleMapsLoaderService.promise) {
      return GoogleMapsLoaderService.promise;
    }

    GoogleMapsLoaderService.promise = new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve(google.maps);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (typeof google !== 'undefined' && google.maps) {
          resolve(google.maps);
        } else {
          reject('Google Maps API not loaded');
        }
      };
      script.onerror = (error: any) => reject(error);
      document.head.appendChild(script);
    });

    return GoogleMapsLoaderService.promise;
  }
}
