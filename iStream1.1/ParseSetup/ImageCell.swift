//
//  ImageCell.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/16/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class ImageCell: UICollectionViewCell {
    
    @IBOutlet weak var newImageView: UIImageView!
    
    @IBOutlet weak var locationLabel: UILabel!
    
    @IBOutlet weak var dateLabel: UILabel!
    
    var image : Image! {
        didSet {
            newImageView.image = image.image
            locationLabel.text = image.location
            dateLabel.text = image.date
        }
    }
    
}
