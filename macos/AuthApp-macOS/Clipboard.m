//
//  Clipboard.m
//  AuthApp-macOS
//
//  Created by Tran Dat on 19/06/2023.
//

#import "Clipboard.h"

@implementation Clipboard

RCT_EXPORT_MODULE(MyClipboardModule);

+ (BOOL)requiresMainQueueSetup {
  return true;
}

+ (instancetype)sharedInstance {
    static Clipboard *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] initPrivate];
    });
    return sharedInstance;
}

- (instancetype)initPrivate {
  self = [super init];
  return self;
}

- (instancetype)init {
    return [[self class] sharedInstance];
}

- (NSDictionary *)constantsToExport {
  return @{ OPEN_FILE: @"open_file" };
}

- (NSArray<NSString *> *)supportedEvents {
  return @[OPEN_FILE];
}

RCT_EXPORT_METHOD(setString:(NSString *)content resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
  [pasteboard clearContents];
  [pasteboard setString:(content) forType:NSPasteboardTypeString];
  resolve(content);
}

RCT_EXPORT_METHOD(getString:(RCTPromiseResolveBlock)resolve
                  rejecter:(__unused RCTPromiseRejectBlock)reject) {
  NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
  resolve(([pasteboard stringForType:NSPasteboardTypeString] ? : @""));
}

@end
