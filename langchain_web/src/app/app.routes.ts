import { Routes } from '@angular/router';
import { HomeContentComponent } from './modules/home/home-content/home-content.component';
import { GameComponentComponent } from './modules/admin-game/components/game-component/game-component.component';
import { ModelosComponent } from './modules/modelos/modelos.component';
import { AgregarEditarModelosComponent } from './modules/agregar-editar-modelos/agregar-editar-modelos.component';
import { ConfigUrlComponent } from './modules/Administracion/config-url/config-url.component';
import { GamesComponent } from './modules/Administracion/games/games.component';
import { AgregarEditarGamesComponent } from './modules/Administracion/agregar-editar-games/agregar-editar-games.component';

export const routes: Routes = [

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeContentComponent },
  { path: 'modelsList', component: ModelosComponent },
  { path: 'createModel', component: AgregarEditarModelosComponent },
  { path: 'editModel/:id', component: AgregarEditarModelosComponent },
  { path: 'admin_game', component: GameComponentComponent },
  { path: 'configUrl', component: ConfigUrlComponent },
  { path: 'gamesList', component: GamesComponent },
  { path: 'createGame', component: AgregarEditarGamesComponent },
  { path: 'editGame/:id', component: AgregarEditarGamesComponent },
];
