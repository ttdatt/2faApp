//
//  Clipboard.h
//  AuthApp-macOS
//
//  Created by Tran Dat on 19/06/2023.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "Constants.h"

NS_ASSUME_NONNULL_BEGIN

@interface Clipboard : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)sharedInstance;

@end

NS_ASSUME_NONNULL_END
