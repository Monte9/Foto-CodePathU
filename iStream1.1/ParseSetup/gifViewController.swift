//
//  gifViewController.swift
//  ParseSetup
//
//  Created by Jasmine Farrell on 4/2/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class gifViewController: UIViewController {

    @IBOutlet weak var imageView: UIImageView!
        override func viewDidLoad() {
            super.viewDidLoad()
            // Do any additional setup after loading the view, typically from a nib.
            
            var imagesName = ["sf1", "sf2", "sf3","sf4", "sf5"]
            
            var images = [UIImage]()
            
            for i in 0..<imagesName.count{
                images.append(UIImage(named: imagesName[i])!)
            }
            
            imageView.animationImages = images
            imageView.animationDuration = 6.0
            imageView.startAnimating()
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
