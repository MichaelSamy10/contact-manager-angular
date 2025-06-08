import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routes';

@NgModule({
  imports: [HttpClientModule, BrowserModule, AppRoutingModule],
  providers: [],
})
export class AppModule {}
