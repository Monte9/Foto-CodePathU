//
//  PhotosViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/16/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import AVFoundation

var frontCamera:Bool=false

class PhotosViewController: UIViewController, XMCCameraDelegate, UICollectionViewDelegate, UICollectionViewDataSource {

    @IBOutlet weak var cameraStill: UIImageView!
    @IBOutlet weak var cameraPreview: UIView!
    @IBOutlet weak var cameraCapture: UIButton!
    @IBOutlet weak var usePhoto: UIButton!
    @IBOutlet weak var RetakePhoto: UIButton!
    @IBOutlet weak var scrollView: UIScrollView!
    
    
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    var preview: AVCaptureVideoPreviewLayer?
    var flippedImage: UIImage!
    var camera: XMCCamera?
    
    var images: [Image]? = []
    
    var sampleImage: [String]? = ["sf1", "sf2", "sf3","sf4", "sf5"]
    var i = 0
    
    var streamId: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()

        //*****taking photo
        
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        self.initializeCamera()
        
        scrollView.delegate = self
        scrollView.contentSize = CGSizeMake(320, 1250)
        //*************
        
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
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        self.establishVideoPreviewArea()
    }
    
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
    
    @IBAction func addNewImage(sender: AnyObject) {
        print("Add new image clicked")
        if (i > 4) {
            i = i%4
            let newImage = Image(image: UIImage(named: sampleImage![i])!, id: streamId)
            images?.insert(newImage, atIndex: 0)
            i += 1
        } else {
            let newImage = Image(image: UIImage(named: sampleImage![i])!, id: streamId)
            images?.insert(newImage, atIndex: 0)
            i += 1
        }
        collectionView.reloadData()
    }
    

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    //*****AVfoundation. Functions for taking photo
    
    @IBAction func onFrontBack(sender: AnyObject) {
        print("onFrontBack")
        if frontCamera == false {
            self.cameraStill.image = nil
            frontCamera = true
            initializeCamera()
            establishVideoPreviewArea()
            
            cameraCapture.hidden=false
            usePhoto.hidden = true
            RetakePhoto.hidden = true
            
        }
        else {
            frontCamera = false
            self.cameraStill.image = nil
            initializeCamera()
            establishVideoPreviewArea()
            
            cameraCapture.hidden=false
            usePhoto.hidden = true
            RetakePhoto.hidden = true
            
        }
    }
    
    func initializeCamera() {
        //self.cameraStatus.text = "Starting Camera"
        self.camera = XMCCamera(sender: self)
    }
    
    func establishVideoPreviewArea() {
        self.preview = AVCaptureVideoPreviewLayer(session: self.camera?.session)
        self.preview?.videoGravity = AVLayerVideoGravityResizeAspectFill
        self.preview?.frame = self.cameraPreview.bounds
        // self.preview?.cornerRadius = 8.0
        self.cameraPreview.layer.addSublayer(self.preview!)
    }

    @IBAction func captureFrame(sender: AnyObject) {
        cameraCapture.hidden=true
        usePhoto.hidden = false
        RetakePhoto.hidden = false
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraPreview.alpha = 0.0;
        })
        
        self.camera?.captureStillImage({ (image) -> Void in
            if image != nil {
                if frontCamera == true{
                    var flippedImage: UIImage = UIImage(CGImage: image!.CGImage!, scale: image!.scale, orientation: .LeftMirrored)
                    self.cameraStill.image = flippedImage;
                }
                else{
                    self.cameraStill.image = image;
                }
                UIView.animateWithDuration(0.225, animations: { () -> Void in
                    self.cameraStill.alpha = 1.0;
                })
            }
        })
    }
    


    
    // MARK: Button Actions
    
    @IBAction func onRetake(sender: AnyObject) {
        cameraCapture.hidden=false
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        UIView.animateWithDuration(0.225, animations: { () -> Void in
            self.cameraStill.alpha = 0.0;
            //self.cameraStatus.alpha = 0.0;
            self.cameraPreview.alpha = 1.0;
            // self.cameraCapture.setTitle("Capture", forState: UIControlState.Normal)
            }, completion: { (done) -> Void in
                self.cameraStill.image = nil;
                //self.status = .Preview
        })
    }
    
    @IBAction func onUse(sender: AnyObject) {
        cameraCapture.hidden=false
        usePhoto.hidden = true
        RetakePhoto.hidden = true
        let newImage = self.cameraStill.image
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
    }
    
    // MARK: Camera Delegate
    
    func cameraSessionConfigurationDidComplete() {
        self.camera?.startCamera()
    }
    
    func cameraSessionDidBegin() {
       // self.cameraStatus.text = ""
        UIView.animateWithDuration(0.225, animations: { () -> Void in
          //  self.cameraStatus.alpha = 0.0
            self.cameraPreview.alpha = 1.0
            self.cameraCapture.alpha = 1.0
            //self.cameraCaptureShadow.alpha = 0.4;
        })
    }
    
    func cameraSessionDidStop() {
       // self.cameraStatus.text = "Camera Stopped"
        UIView.animateWithDuration(0.225, animations: { () -> Void in
           // self.cameraStatus.alpha = 1.0
            self.cameraPreview.alpha = 0.0
        })
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
