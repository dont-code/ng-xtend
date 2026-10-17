import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { SelectButton } from 'primeng/selectbutton';
import { Panel } from 'primeng/panel';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { TesterSessionService } from '../core/tester-session.service';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

type StorageMode = { label: string; value: boolean };

@Component({
  selector: 'app-test-configure',
  imports: [FormsModule, AutoComplete, SelectButton, Panel, Button, Divider, Tag, PageHeaderComponent],
  templateUrl: './test-configure.component.html',
  styleUrl: './test-configure.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestConfigureComponent {
  protected readonly session = inject(TesterSessionService);

  readonly modes: StorageMode[] = [
    { label: 'In memory', value: true },
    { label: 'Remote service', value: false },
  ];

  /** true = memory, false = remote service. Initialised from the session. */
  readonly mode = signal<boolean>(this.session.inMemory());
  readonly docUrl = signal<string | null>(this.session.docUrl());

  readonly filteredDocUrls = signal<string[]>([]);

  readonly modeHelp = computed(() =>
    this.mode()
      ? 'Documents are kept only for the duration of this session. Nothing is persisted.'
      : 'Documents are read from and written to a remote service (the Dont-Code document API).'
  );

  filterDocUrls(event: AutoCompleteCompleteEvent): void {
    const query = event.query ?? '';
    this.filteredDocUrls.set(
      this.session.knownDocUrls.filter((url) => url.toLowerCase().includes(query.toLowerCase()))
    );
  }

  apply(): void {
    this.session.applyConfig(this.mode(), this.mode() ? null : this.docUrl());
  }
}
