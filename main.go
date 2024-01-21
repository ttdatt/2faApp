package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	app.WriteLog("Init App")

	RootMenu := menu.NewMenu()
	AppMenu := RootMenu.AddSubmenu("App")

	FileMenu := RootMenu.AddSubmenu("File")
	FileMenu.AddText("Import", keys.CmdOrCtrl("o"), func(cd *menu.CallbackData) {
		// runtime.WindowExecJS(app.ctx, `window.testFunc("Hello from Golang");`)
		runtime.EventsEmit(app.ctx, "open-file", "import click")
	})
	FileMenu.AddSeparator()
	FileMenu.AddText("Close", keys.CmdOrCtrl("w"), func(_ *menu.CallbackData) {
		runtime.Quit(app.ctx)
	})
	AppMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(app.ctx)
	})

	app.WriteLog("Starting")

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Authenticator",
		Width:  480,
		Height: 768,
		Menu:   RootMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})

	app.WriteLog("Running")
	app.WriteLog("====================")

	if err != nil {
		println("Error:", err.Error())
	}
}
