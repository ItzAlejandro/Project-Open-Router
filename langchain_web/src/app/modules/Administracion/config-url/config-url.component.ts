import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigUrlService } from 'src/app/services/config-url.service';
import { SweetAlertComponent } from 'src/app/shared/component/sweet-alert/sweet-alert.component';

@Component({
  selector: 'app-config-url',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './config-url.component.html'
})
export class ConfigUrlComponent implements OnInit{
  ngOnInit(): void {
    this.getUrl();
  }
  urls: { id: string; url: string }[] = [];
  editIndex: number | null = null;
  editedUrl: string = '';
  private readonly service = inject(ConfigUrlService);
  private readonly sweetalert: SweetAlertComponent = new SweetAlertComponent();

  toggleEdit(index: number): void {
    if (this.editIndex === index) {
      const id = this.urls[index].id;
      this.urls[index].url = this.editedUrl;

      this.service.UpdateUrl(id, this.editedUrl).subscribe({
        next: () => {
          this.sweetalert.sweetCorrecto("URL"," Guardado Correctamente");
        },
        error: (err) => {
          this.sweetalert.sweetError('Error',err.error?.detail || "Ocurrió un error desconocido")
        }
      });

      this.editIndex = null;
    } else {
      this.editIndex = index;
      this.editedUrl = this.urls[index].url;
    }
  }

    private getUrl():void{
      this.service.getUrl().subscribe(response => {
        if (response) {
          this.urls = response;
        }
  })
}

}
