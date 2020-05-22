import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import styles from './AppCustomizer.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'OncHeaderApplicationCustomizerStrings';

const LOG_SOURCE: string = 'OncHeaderApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IOncHeaderApplicationCustomizerProperties {
  TopString: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class OncHeaderApplicationCustomizer
  extends BaseApplicationCustomizer<IOncHeaderApplicationCustomizerProperties> {

    // These have been added
    private _topPlaceholder: PlaceholderContent | undefined;
    private _externalJsUrl: string [] = [
      //"https://hhsgov.sharepoint.com/sites/onc/SiteAssets/jquery.min.js",
      //"https://hhsgov.sharepoint.com/sites/onc/SiteAssets/bootstrap.js"
    ];
    private _externalCssUrl: string [] = [
      //"https://hhsgov.sharepoint.com/sites/onc/SiteAssets/bootstrap1.css"
      //,
      //"https://use.fontawesome.com/releases/v5.5.0/css/all.css"
    ];

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized...`);
    
    for (var i=0; i<this._externalJsUrl.length; i++) {
      var scriptTag: HTMLScriptElement = document.createElement("script");
      scriptTag.src = this._externalJsUrl[i];
      scriptTag.type = "text/javascript";
      if (i==0) {
        scriptTag.onload = () => {
          console.log("1st script loaded and ready...");
        };
      }
      document.getElementsByTagName("head")[0].appendChild(scriptTag);
    }
    for (i=0; i<this._externalCssUrl.length; i++) {
      var cssTag: HTMLLinkElement = document.createElement("link");
      cssTag.href = this._externalCssUrl[i];
      cssTag.type = "text/css";
      document.getElementsByTagName("head")[0].appendChild(cssTag);
    }

    console.log(`CobGlobalJsApplicationCustomizer.onInit(): Added script link.`);
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

    console.log(`CobGlobalJsApplicationCustomizer.onInit(): Leaving.`);
    return Promise.resolve<void>();
  }

  private _renderPlaceHolders(): void {
    console.log("OncHeaderApplicationCustomizer._renderPlaceHolders()");
    console.log(
      "Available placeholders: ",
      this.context.placeholderProvider.placeholderNames
        .map(name => PlaceholderName[name])
        .join(", ")
    );

    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        console.error("The expected placeholder (Top) was not found.");
        return;
      }

      if (this.properties) {
        let topString: string = this.properties.TopString;
        if (!topString) {
          topString = "";
        }

        if (this._topPlaceholder.domElement) {
          this._topPlaceholder.domElement.innerHTML = `
          <div id="oncmenubar" class="navbar navbar-default navbar-static-top" style="width:100%;position:relative;left:1px!important;padding-left:0px!important">
          </div>          
          `;

          var script = document.createElement( "script" );
          script.text = `
            function loadScript(url, callback)
            {
                var head = document.head;
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                script.onreadystatechange = callback;
                script.onload = callback;
                head.appendChild(script);
            }
            function locaCss(url, callback) {
              var element = document.createElement("link");
              element.setAttribute("rel", "stylesheet");
              element.setAttribute("type", "text/css");
              element.setAttribute("href", url);
              document.getElementsByTagName("head")[0].appendChild(element);
              element.onload = callback;
            }          
            function loadAllObjects() {
              console.log('jquery loading completed....');
              loadScript("https://hhsgov.sharepoint.com/sites/onc/SiteAssets/bootstrap.js", function(){console.log("bootstrap.js ready")});
              locaCss("https://hhsgov.sharepoint.com/sites/onc/SiteAssets/bootstrap1.css", function(){console.log("bootstrap.css ready")});
              locaCss("https://use.fontawesome.com/releases/v5.5.0/css/all.css", function(){console.log("fontawesome.css ready")});
              jQuery(document).ready(function(){
                jQuery.get('https://hhsgov.sharepoint.com/sites/onc/SiteAssets/header-dropdown-menu.txt', function(tdata) {
                  $('#oncmenubar').html(tdata);
                });
                $(".dropdown").hover(
                    function() { $('.dropdown-menu', this).stop().fadeIn("fast");
                    },
                    function() { $('.dropdown-menu', this).stop().fadeOut("fast");
                });
              });
            }
            loadScript("https://hhsgov.sharepoint.com/sites/onc/SiteAssets/jquery.min.js", loadAllObjects);
            console.log('jquery loading started....');
          `;
          document.head.appendChild( script ).parentNode.removeChild( script ); 
        }
      }
    }
  }

  private _onDispose(): void {
    console.log('[OncHeaderApplicationCustomizer._onDispose] Disposed app.');
  }
}
