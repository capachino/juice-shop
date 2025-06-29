/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialogRef } from '@angular/material/dialog'
import { CookieService } from 'ngy-cookie'
import { TranslateModule } from '@ngx-translate/core'
import { ExtendedModule } from '@angular/flex-layout/extended'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { NgIf } from '@angular/common'

@Component({
  selector: 'app-welcome-banner',
  templateUrl: 'welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.scss'],
  imports: [NgIf, MatButtonModule, MatIconModule, ExtendedModule, TranslateModule]
})
export class WelcomeBannerComponent implements OnInit {
  public title: string = 'Welcome to Juice Shop'
  public message: string = "The best ecommerce experience on the Web"
  public showDismissBtn: boolean = true

  private readonly welcomeBannerStatusCookieKey = 'welcomebanner_status'

  constructor (
    public dialogRef: MatDialogRef<WelcomeBannerComponent>,
    private readonly configurationService: ConfigurationService,
    private readonly cookieService: CookieService) { }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config?.application?.welcomeBanner) {
        this.title = config.application.welcomeBanner.title
        this.message = config.application.welcomeBanner.message
      }
    }, (err) => { console.log(err) })
  }

  closeWelcome (): void {
    this.dialogRef.close()
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    this.cookieService.put(this.welcomeBannerStatusCookieKey, 'dismiss', { expires })
  }
}
