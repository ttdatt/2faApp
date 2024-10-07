//
//  MyRootViewController.swift
//  AuthApp-macOS
//
//  Created by Tran Dat on 31/08/2023.
//

import Foundation
import Cocoa

@objc public class MyRootViewController: NSViewController {
  @objc public func addImportSubMenuItem() {
    let newItem = NSMenuItem(title: "Import", action: #selector(newItemClicked(_:)), keyEquivalent: "I")
    newItem.keyEquivalentModifierMask = [.command]
    if let fileMenu = NSApp.mainMenu?.item(withTitle: "File")?.submenu {
      fileMenu.insertItem(newItem, at: 0)
    }
  }

  @objc func newItemClicked(_ sender: NSMenuItem) {
    print("newItemClicked")
    let openPanel = NSOpenPanel()
    openPanel.canChooseFiles = true
    openPanel.begin { response in
      if response == .OK {
        guard let selectedURL = openPanel.url else { return }
        print("\(selectedURL)")
        Clipboard.sharedInstance().sendEvent(withName: OPEN_FILE, body: selectedURL.absoluteString)
      }
    }
  }
}
