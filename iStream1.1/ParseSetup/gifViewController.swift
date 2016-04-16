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
    
    @IBOutlet weak var dismissButton: UIButton!
    
    @IBOutlet weak var shareButton: UIButton!
    
    var myImages: [Image] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()

        var images = [UIImage]()
        
        for i in 0..<myImages.count{
            images.append(myImages[i].image!)
        }
        
        imageView.animationImages = images
        imageView.animationDuration = 6.0
        imageView.startAnimating()
    }
    
    @IBAction func onShareButton(sender: AnyObject) {
        print("Implement share feature")
    }
    
    @IBAction func onDismissButton(sender: AnyObject) {
        self.dismissViewControllerAnimated(false, completion: nil)
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
