//
//  ViewController.swift
//  MediumMenu-Sample
//
//  Created by Jasmine Farrell on 2/18/16.
//  Copyright © 2016 JIFarrell. All rights reserved.
//

import UIKit

class BaseViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let icon = UIBarButtonItem(image: UIImage(named: "icon"), style: .Plain, target: navigationController, action: "showMenu")
        icon.imageInsets = UIEdgeInsetsMake(-10, 0, 0, 0)
        icon.tintColor = UIColor.whiteColor()
        navigationItem.leftBarButtonItem = icon
    } 
}
