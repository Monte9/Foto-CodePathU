//
//  PhotosViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/16/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class PhotosViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource {

    @IBOutlet weak var collectionView: UICollectionView!
    
    var images: [Image]? = []
    
    var sampleImage: [String]? = ["sf1", "sf2", "sf3","sf4", "sf5"]
    var i = 0
    
    var streamId: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()

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
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
