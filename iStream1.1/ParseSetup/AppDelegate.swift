//
//  AppDelegate.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/12/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import Parse
import Onboard

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        
        UIApplication.sharedApplication().statusBarStyle = .LightContent
        
        Parse.initializeWithConfiguration(
            ParseClientConfiguration(block: { (configuration:ParseMutableClientConfiguration) -> Void in
                configuration.applicationId = "super.app"
                configuration.clientKey = "kajsdhf23uhn8ushaiufb283ihn"
                configuration.server = "https://dry-scrubland-71159.herokuapp.com/parse"
            })
        )
        
        window = UIWindow(frame: UIScreen.mainScreen().bounds)
        
        var storyboard = UIStoryboard(name: "Main", bundle: nil)
        
        let firstPage = OnboardingContentViewController(title: "Take a picture", body: "Also lets you have a timer", image: nil, buttonText: "") {
        }
        
        let secondPage = OnboardingContentViewController(title: "Create new streams", body: "Add pictures to existing streams", image: nil, buttonText: "") {
        }
        
        let thirdPage = OnboardingContentViewController(title: "Create a gif", body: "With the press of one button", image: nil, buttonText: "Explore iStream now!") {
            let homeViewController = storyboard.instantiateViewControllerWithIdentifier("rootViewController")
            self.window?.rootViewController = homeViewController
            self.window?.makeKeyAndVisible()
        }
        
        let onboardingVC = OnboardingViewController(backgroundImage: UIImage(named: "icon"), contents: [firstPage, secondPage, thirdPage])
        
        window?.rootViewController = onboardingVC
        window?.makeKeyAndVisible()
        
        return true
    }

    func applicationWillResignActive(application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(application: UIApplication) {
        // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

