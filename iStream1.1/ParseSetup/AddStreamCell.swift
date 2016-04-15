//
//  AddStreamCell.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/15/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit

class AddStreamCell: UITableViewCell {

    @IBOutlet weak var streamProfilePicture: UIImageView!
    
    @IBOutlet weak var streamName: UILabel!
    
    @IBOutlet weak var createdAtLabel: UILabel!
    @IBOutlet weak var selectSwitch: UISwitch!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    
    var stream : Stream! {
        didSet {
            streamName.text = stream.name
            createdAtLabel.text = stream.date
        }
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
