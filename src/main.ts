import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environments.production';
import { enableProdMode } from '@angular/core';

if (environment.production) {
  enableProdMode();//Cải thiện hiệu suất bằng cách giảm logging không cần thiết.
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
