//
//  ProfileViewController.swift
//  MediumMenu
//
//  Created by Jasmine Farrell on 2/18/16.
//  Copyright © 2016 JIFarrell. All rights reserved.
//

import UIKit

class ProfileViewController: BaseViewController {
    @IBOutlet weak var profileImage: UIImageView!
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: NSBundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    
        
        profileImage.clipsToBounds = true
        profileImage.layer.cornerRadius = 8.0
        profileImage.layer.cornerRadius = 10
        profileImage.clipsToBounds = true
        profileImage.layer.borderWidth = 3
        profileImage.layer.borderColor = UIColor.whiteColor().CGColor
    }
}