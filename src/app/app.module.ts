import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule  } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchformComponent } from './components/searchform/searchform.component';
import { QueryService } from './services/query.service';
import { GraphComponent } from './components/graph/graph.component';


const routes: Routes = [
  { path: '', component: SearchformComponent },
  { path: ':title', component: SearchformComponent },
  { path: '**', component: SearchformComponent }
];
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SearchformComponent,
    GraphComponent
  ],
  imports: [
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    FormsModule,
    NgxChartsModule
  ],
  providers: [
    QueryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
