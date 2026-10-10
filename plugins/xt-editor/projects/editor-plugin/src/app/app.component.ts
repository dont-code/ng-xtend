import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XtResolverService } from 'xt-components';
import { registerEditorPlugin } from '../../../editor/src/lib/register';
import { registerDefaultPlugin } from 'xt-plugin-default';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EditorTester';

  protected resolverService = inject (XtResolverService);

  constructor () {
    registerDefaultPlugin (this.resolverService);
    registerEditorPlugin(this.resolverService);
  }

}
