//
//  PhotosViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/16/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class PhotosViewController: UIViewController,  UICollectionViewDelegate, UICollectionViewDataSource {

    @IBOutlet weak var collectionView: UICollectionView!
    
    var images: [Image]? = []
 
    var streamId: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //Make the status bar white color
        UIApplication.sharedApplication().statusBarStyle = .Default
        
        collectionView.delegate = self
        collectionView.dataSource = self
        
        Image.getImagesInStream(streamId) { (images, success, error) -> () in
            if error == nil {
                self.images = images
                self.collectionView.reloadData()
                print("Images info found and loaded with stream id: \(self.streamId)!")
            }
        }
    }
    
//    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {
//        let size = CGSize(width: collectionView.frame.size.width, height: collectionView.frame.size.height)
//        
//        return size
//    }
    
    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return images?.count ?? 0
    }
    
    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("ImageCell", forIndexPath: indexPath) as! ImageCell
        
        if (images != nil) {
            cell.image = images![indexPath.row]
        }
        
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // MARK: Button Actions
    
   /*
    @IBAction func onUse(sender: AnyObject) {
        cameraCapture.hidden=false
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        let newImage = Image(image: self.cameraStill.image!, id: streamId)
        images?.insert(newImage, atIndex: 0)
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraStill.alpha = 0.0;
            //self.cameraStatus.alpha = 0.0;
            self.cameraPreview.alpha = 1.0;
            //self.cameraCapture.setTitle("Capture", forState: UIControlState.Normal)
            }, completion: { (done) -> Void in
                self.cameraStill.image = nil;
                //self.status = .Preview
        })
        collectionView.reloadData()
    }
    
    */
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        let gifNavController = segue.destinationViewController as! UINavigationController
        let giffyViewController = gifNavController.topViewController as! gifViewController
        giffyViewController.myImages = self.images!
        
        //        if (segue == "takePictureSegue") {
//            let cameraViewController = sender?.destinationViewController as! CameraViewController
//            cameraViewController.profileButton.hidden = true
//            cameraViewController.streams.hidden = true
//        }
    }
}
