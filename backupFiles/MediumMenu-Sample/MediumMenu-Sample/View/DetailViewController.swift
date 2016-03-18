//
//  DetailViewController.swift
//  iStream
//
//  Created by Veronika Kotckovich on 3/5/16.
//  Copyright © 2016 pixyzehn. All rights reserved.
//

import UIKit

class DetailViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate, UICollectionViewDelegate, UICollectionViewDataSource {
    
    let imagePicker = UIImagePickerController()
    
    var images: [UIImage?] = [UIImage(named: "addImage")]
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    @IBOutlet weak var cameraButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        collectionView.delegate = self
        collectionView.dataSource = self
        
        cameraButton.backgroundColor = UIColor.blackColor()
        cameraButton.layer.cornerRadius = 25
        cameraButton.layer.borderWidth = 1
        cameraButton.layer.borderColor = UIColor.blackColor().CGColor
    }
    
    func collectionView(collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {
        let size = CGSize(width: collectionView.frame.size.width, height: collectionView.frame.size.height)
        
        return size
    }
    
    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        print(images.count)
        return images.count
    }
    
    // The cell that is returned must be retrieved from a call to -dequeueReusableCellWithReuseIdentifier:forIndexPath:
    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("PhotosCell", forIndexPath: indexPath) as! PhotosCollectionViewCell
        
        
        if let image = images[indexPath.row] {
            cell.imageViewer.image = image
        }
        else {
            cell.imageViewer.image = UIImage(named: "addImage")
        }
        
        return cell
    }
    
    
    
    
    func imagePickerController(picker: UIImagePickerController, didFinishPickingImage image: UIImage!, editingInfo: [NSObject : AnyObject]!) {
        
        images.insert(image, atIndex: 0)
        saveToCamera(image)
        //        images.append(image)
        //        if let imageArray = images.reverse() as? [UIImage?] {
        //            print("The array should be reversed")
        //            images = imageArray
        //        }
        //        print("Reloading collection now")
        self.collectionView.reloadData()
        dismissViewControllerAnimated(true, completion: nil)
        
    }
    
    @IBAction func presentImagePicker(sender: AnyObject) {
        if UIImagePickerController.isCameraDeviceAvailable( UIImagePickerControllerCameraDevice.Front) {
            
            imagePicker.delegate = self
            imagePicker.sourceType = UIImagePickerControllerSourceType.Camera
            presentViewController(imagePicker, animated: true, completion: nil)
            
        }
    }
    
    
    
    func saveToCamera(image: UIImage?) {
        UIImageWriteToSavedPhotosAlbum(image!, nil, nil, nil)
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
