import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CRUDService } from '../service/crud.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  totalAdmin: number = 0;
  totalEntreprise: number = 0;
  totalEtudiant: number = 0;
  totalInstitution: number = 0;

  myGroup: FormGroup;
  private percentageChart?: Chart;
  private adminChart?: Chart;
  private etudiantChart?: Chart;
  private entrepriseChart?: Chart;
  private institutionChart?: Chart;
  private timer: any;

  constructor(private router: Router, private service: CRUDService) {
    this.myGroup = new FormGroup({ firstName: new FormControl() });
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Ne rien initialiser ici — le DOM n'est pas encore prêt
  }

  // ✅ AfterViewInit garantit que les canvas existent dans le DOM
  ngAfterViewInit(): void {
    this.initSparklines();
    this.loadStats();
    this.timer = setInterval(() => { this.loadStats(); }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    [
      this.percentageChart,
      this.adminChart,
      this.etudiantChart,
      this.entrepriseChart,
      this.institutionChart
    ].forEach(c => c?.destroy());
  }

  initSparklines(): void {
    const makeConfig = (color: string): any => ({
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          data: [3, 5, 2, 8, 4, 7],
          borderColor: color,
          backgroundColor: color + '22',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    const adminEl      = document.getElementById('adminCanvas')      as HTMLCanvasElement | null;
    const etudiantEl   = document.getElementById('etudiantCanvas')   as HTMLCanvasElement | null;
    const entrepriseEl = document.getElementById('entrepriseCanvas') as HTMLCanvasElement | null;
    const institutionEl= document.getElementById('institutionCanvas')as HTMLCanvasElement | null;

    if (adminEl)       this.adminChart       = new Chart(adminEl,       makeConfig('#0d6efd'));
    if (etudiantEl)    this.etudiantChart    = new Chart(etudiantEl,    makeConfig('#198754'));
    if (entrepriseEl)  this.entrepriseChart  = new Chart(entrepriseEl,  makeConfig('#ffc107'));
    if (institutionEl) this.institutionChart = new Chart(institutionEl, makeConfig('#6f42c1'));
  }

  loadStats(): void {
    forkJoin({
      admins:       this.service.getAllAdmins().pipe(catchError(() => of([]))),
      entreprises:  this.service.getAllEntreprises().pipe(catchError(() => of([]))),
      etudiants:    this.service.getAllEtudiants().pipe(catchError(() => of([]))),
      institutions: this.service.getAllInstitutions().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ admins, entreprises, etudiants, institutions }) => {
        this.totalAdmin       = Array.isArray(admins)       ? admins.length       : 0;
        this.totalEntreprise  = Array.isArray(entreprises)  ? entreprises.length  : 0;
        this.totalEtudiant    = Array.isArray(etudiants)    ? etudiants.length    : 0;
        this.totalInstitution = Array.isArray(institutions) ? institutions.length : 0;
        this.renderOrUpdatePercentageChart();
      },
      error: (err) => console.error('Erreur loadStats:', err)
    });
  }

  renderOrUpdatePercentageChart(): void {
    const total = this.totalAdmin + this.totalEntreprise +
                  this.totalEtudiant + this.totalInstitution;

    const pct = (n: number) => total ? parseFloat(((n / total) * 100).toFixed(1)) : 0;

    const data = [
      pct(this.totalAdmin),
      pct(this.totalEntreprise),
      pct(this.totalEtudiant),
      pct(this.totalInstitution)
    ];

    if (this.percentageChart) {
      this.percentageChart.data.datasets[0].data = data;
      this.percentageChart.update();
      return;
    }

    const canvas = document.getElementById('percentageCanvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    this.percentageChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Administrateurs', 'Entreprises', 'Étudiants', 'Institutions'],
        datasets: [{
          label: 'Répartition globale',
          data,
          backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#6f42c1'],
          borderWidth: 2
        }]
      },
      options: {
        // ✅ Taille fixe — plus de redimensionnement dynamique
        responsive: false,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Répartition : Administrateurs / Entreprises / Étudiants / Institutions'
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label} : ${Number(ctx.raw).toFixed(1)} %`
            }
          }
        }
      }
    });
  }
}