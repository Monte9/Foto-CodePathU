//
//  CustomCell.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 3/12/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class StreamCell: UITableViewCell {

    @IBOutlet weak var streamNameLabel: UILabel!
    
    @IBOutlet weak var streamDateLabel: UILabel!    
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    
    var stream : Stream! {
        didSet {
            streamNameLabel.text = stream.name
            streamDateLabel.text = stream.date
        }
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
