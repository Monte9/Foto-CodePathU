//
//  ProfileViewController.swift
//  gifsty
//
//  Created by Jasmine Farrell on 2/18/16.
//  Copyright © 2016 JIFarrell. All rights reserved.
//

import UIKit

class ProfileViewController: UIViewController {
    
    @IBOutlet weak var profileImage: UIImageView!
    @IBOutlet weak var backgroundImageView: UIImageView!    
    @IBOutlet weak var userNameLabel: UILabel!
    /*
    @IBAction func blurImage(sender: AnyObject) {
    // 1
    let darkBlur = UIBlurEffect(style: UIBlurEffectStyle.Dark)
    // 2
    let blurView = UIVisualEffectView(effect: darkBlur)
    blurView.frame = imageView.bounds
    // 3
    imageView.addSubview(blurView)
    }*/
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let blurEffect = UIBlurEffect(style: UIBlurEffectStyle.Light)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = backgroundImageView.bounds
        backgroundImageView.addSubview(blurView)
        
        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
