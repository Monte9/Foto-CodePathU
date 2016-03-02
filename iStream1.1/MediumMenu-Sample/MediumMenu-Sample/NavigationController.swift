//
//  NavigationController.swift
//  MediumMenu
//
//  Created by Jasmine Farrell on 2/18/16.
//  Copyright © 2016 JIFarrell. All rights reserved.
//

import UIKit

class NavigationController: UINavigationController {
   
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    var menu: MediumMenu?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        UIApplication.sharedApplication().statusBarStyle = .LightContent

        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let profileViewController = storyboard.instantiateViewControllerWithIdentifier("Profile") as! ProfileViewController
        setViewControllers([profileViewController], animated: false)

        let item1 = MediumMenuItem(title: "Profile") {
            let profileViewController = storyboard.instantiateViewControllerWithIdentifier("Profile") as! ProfileViewController
            self.setViewControllers([profileViewController], animated: false)
        }
        
        let item2 = MediumMenuItem(title: "iStream") {
            let streamViewController = storyboard.instantiateViewControllerWithIdentifier("Stream") as! StreamViewController
            self.setViewControllers([streamViewController], animated: false)
        }
        
        let item3 = MediumMenuItem(title: "Links") {
            let linksViewController = storyboard.instantiateViewControllerWithIdentifier("Links") as! LinksViewController
            self.setViewControllers([linksViewController], animated: false)
        }
        
        let item5 = MediumMenuItem(title: "Sign out") {
            let signoutViewController = storyboard.instantiateViewControllerWithIdentifier("Signout") as! SignoutViewController
            self.setViewControllers([signoutViewController], animated: false)
        }

        menu = MediumMenu(items: [item1, item2, item3, item5], forViewController: self)
    }
    
    func showMenu() {
        menu?.show()
    }
}

extension UINavigationBar {
    public override func sizeThatFits(size: CGSize) -> CGSize {
        return CGSizeMake(UIScreen.mainScreen().bounds.size.width, 60)
    }
}
