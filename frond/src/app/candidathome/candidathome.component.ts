import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CRUDService } from '../service/crud.service';

interface Slide {
  image?: string;
  text: string;
  author?: string;
  isAnimated?: boolean;
  stats?: { value: string; label: string }[];
}

interface TypePhrase {
  word: string;
  sub: string;
  color: string;
}

@Component({
  selector: 'app-candidathome',
  templateUrl: './candidathome.component.html',
  styleUrls: ['./candidathome.component.css']
})
export class CandidathomeComponent implements OnInit, OnDestroy {

  recommandations: any[] = []; 

  currentIndex = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly SLIDE_INTERVAL_MS = 3000;

  slides: Slide[] = [
    {
      isAnimated: true,
      text: 'Bienvenue sur InternMatch',
      author: "Trouve ton avenir dès aujourd'hui",
      stats: [
        { value: '150K+', label: 'Offres actives' },
        { value: '50K+',  label: 'Entreprises'   },
        { value: '98%',   label: 'Satisfaction'  }
      ]
    },
    { image: 'assets/images/home/img-02.png', text: "Fais ce que tu aimes et tu ne travailleras jamais", author: '- Marc Anthony' },
    { image: 'assets/images/home/img-03.png', text: '"Le succès vient du travail"', author: '- Vidal Sassoon' },
    { image: 'assets/images/home/img-04.png', text: '"Travailler, c\'est réussir"', author: '- Albert Schweitzer' }
  ];

  readonly phrases: TypePhrase[] = [
    { word: 'Emploi',      sub: '', color: '#7c3aed' },
  ];

  typedText     = '';
  showSubline   = false;
  currentPhrase = 0;
  activeFilter  = 'all';

  private typeTimer: ReturnType<typeof setTimeout> | null = null;
  private charIdx    = 0;
  private deleting   = false;
  private pauseCount = 0;
  private readonly PAUSE_TICKS = 32;

  get activePhrase(): TypePhrase { return this.phrases[this.currentPhrase]; }

  constructor(public router: Router, private crudService: CRUDService) {} // ✅

  ngOnInit(): void {
    this.startAutoPlay();
    this.tick();
    this.loadRecommandations(); // ✅
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    if (this.typeTimer) clearTimeout(this.typeTimer);
  }

  // ✅ Charger les recommandations
  private loadRecommandations(): void {
    const user = this.crudService.userDetails();
    if (!user) return;

    const role = (user.role || '').toLowerCase();
    const id   = user.id;

    if (!id || !role) return;

    this.crudService.getRecommandations(role, id).subscribe({
      next: (data) => {
        console.log('Recommandations candidat :', data);
        this.recommandations = data;
      },
      error: (err) => console.error('Erreur recommandations :', err)
    });
  }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => this.nextSlide(), this.SLIDE_INTERVAL_MS);
  }
  private stopAutoPlay(): void {
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  }
  nextSlide():  void { this.currentIndex = (this.currentIndex + 1) % this.slides.length; }
  prevSlide():  void { this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length; }
  goToSlide(i: number): void { if (i >= 0 && i < this.slides.length) this.currentIndex = i; }
  pauseAutoPlay():  void { this.stopAutoPlay(); }
  resumeAutoPlay(): void { if (this.intervalId === null) this.startAutoPlay(); }
  filterByType(type: string): void { this.activeFilter = type; }

  private tick(): void {
    const target = this.activePhrase.word;
    if (!this.deleting) {
      this.typedText = target.slice(0, ++this.charIdx);
      if (this.charIdx >= target.length) {
        this.showSubline = true;
        if (++this.pauseCount >= this.PAUSE_TICKS) {
          this.deleting = true; this.pauseCount = 0; this.showSubline = false;
        }
        this.typeTimer = setTimeout(() => this.tick(), 90);
        return;
      }
      this.typeTimer = setTimeout(() => this.tick(), 60 + Math.random() * 40);
    } else {
      this.typedText = target.slice(0, this.charIdx--);
      if (this.charIdx < 0) {
        this.deleting = false; this.charIdx = 0;
        this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
        this.typeTimer = setTimeout(() => this.tick(), 420);
        return;
      }
      this.typeTimer = setTimeout(() => this.tick(), 30 + Math.random() * 25);
    }
  }

  jumpToPhrase(idx: number): void {
    if (this.typeTimer) clearTimeout(this.typeTimer);
    this.currentPhrase = idx;
    this.charIdx = 0; this.deleting = false;
    this.pauseCount = 0; this.showSubline = false; this.typedText = '';
    this.tick();
  }
  searchQuery = '';
selectedLocalisation = '';

rechercherOffres(): void {
  this.router.navigate(['/listoffres'], {
    queryParams: {
      query:        this.searchQuery        || null,
      localisation: this.selectedLocalisation || null
    }
  });
}
}